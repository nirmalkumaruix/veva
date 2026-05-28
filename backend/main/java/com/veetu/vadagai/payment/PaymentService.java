package com.veetu.vadagai.payment;

import com.veetu.vadagai.invoice.Invoice;
import com.veetu.vadagai.invoice.InvoiceRepository;
import com.veetu.vadagai.notification.Notification;
import com.veetu.vadagai.notification.NotificationRepository;
import com.veetu.vadagai.payment.PaymentDtos.PaymentRequest;
import com.veetu.vadagai.payment.PaymentDtos.PaymentResponse;
import com.veetu.vadagai.payment.PaymentDtos.RazorpayWebhook;
import com.veetu.vadagai.property.Property;
import com.veetu.vadagai.property.PropertyRepository;
import com.veetu.vadagai.tenant.TenantRepository;
import com.veetu.vadagai.user.CurrentUserService;
import com.veetu.vadagai.user.Role;
import com.veetu.vadagai.user.User;
import com.veetu.vadagai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository payments;
    private final PropertyRepository properties;
    private final TenantRepository tenants;
    private final UserRepository users;
    private final InvoiceRepository invoices;
    private final NotificationRepository notifications;
    private final CurrentUserService current;

    @Transactional
    public PaymentResponse create(PaymentRequest r) {
        var actor = current.get();
        var property = propertyFor(actor, r.propertyId());
        var payer = payerFor(actor, property, r.payerId());
        var pay = payments.save(Payment.builder()
                .payer(payer)
                .property(property)
                .type(r.type())
                .status(PaymentStatus.CREATED)
                .amount(r.amount())
                .lateFee(lateFee(r.amount(), r.dueDate()))
                .dueDate(r.dueDate())
                .gatewayOrderId("order_" + UUID.randomUUID().toString().replace("-", ""))
                .build());
        createInvoice(pay);
        notify(payer, "Payment request created", "A " + r.type() + " payment of Rs." + r.amount() + " is ready for " + property.getTitle() + ".");
        return map(pay);
    }

    @Transactional
    public PaymentResponse webhook(RazorpayWebhook w) {
        var pay = payments.findByGatewayOrderIdAndDeletedFalse(w.orderId()).orElseThrow();
        pay.setGatewayPaymentId(w.paymentId());
        pay.setStatus("captured".equalsIgnoreCase(w.status()) ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        pay.setReceiptUrl("/api/v1/invoices/" + pay.getId() + "/pdf");
        invoices.findByPaymentIdAndDeletedFalse(pay.getId()).ifPresent(i -> i.setPdfUrl(pay.getReceiptUrl()));
        notify(pay.getPayer(), "Payment " + pay.getStatus().name().toLowerCase(), "Your payment for " + pay.getProperty().getTitle() + " is " + pay.getStatus() + ".");
        return map(pay);
    }

    @Transactional
    public PaymentResponse markSuccess(UUID paymentId) {
        var pay = paymentVisibleToCurrent(paymentId);
        pay.setStatus(PaymentStatus.SUCCESS);
        pay.setGatewayPaymentId("manual_" + UUID.randomUUID().toString().replace("-", ""));
        pay.setReceiptUrl("/api/v1/invoices/" + pay.getId() + "/pdf");
        invoices.findByPaymentIdAndDeletedFalse(pay.getId()).ifPresent(i -> i.setPdfUrl(pay.getReceiptUrl()));
        notify(pay.getPayer(), "Receipt generated", "Receipt is available for " + pay.getProperty().getTitle() + ".");
        return map(pay);
    }

    @Transactional
    public PaymentResponse refund(UUID paymentId) {
        var pay = paymentVisibleToCurrent(paymentId);
        pay.setStatus(PaymentStatus.REFUNDED);
        notify(pay.getPayer(), "Refund processed", "A refund entry was recorded for " + pay.getProperty().getTitle() + ".");
        return map(pay);
    }

    @Transactional
    public PaymentResponse remind(UUID paymentId) {
        var pay = paymentVisibleToCurrent(paymentId);
        notify(pay.getPayer(), "Rent reminder", "Reminder: Rs." + pay.getAmount() + " is due on " + pay.getDueDate() + " for " + pay.getProperty().getTitle() + ".");
        return map(pay);
    }

    public Page<PaymentResponse> mine(Pageable p) {
        var user = current.get();
        if (user.getRoles().contains(Role.OWNER) || user.getRoles().contains(Role.ADMIN)) {
            return payments.findByPropertyOwnerIdAndDeletedFalse(user.getId(), p).map(this::map);
        }
        return payments.findByPayerIdAndDeletedFalse(user.getId(), p).map(this::map);
    }

    private Property propertyFor(User actor, UUID propertyId) {
        if (actor.getRoles().contains(Role.OWNER)) {
            return properties.findByIdAndOwnerIdAndDeletedFalse(propertyId, actor.getId()).orElseThrow();
        }
        if (actor.getRoles().contains(Role.TENANT)) {
            var tenant = tenants.findByUserIdAndDeletedFalse(actor.getId()).orElseThrow();
            if (!tenant.getProperty().getId().equals(propertyId)) {
                throw new IllegalArgumentException("Tenant is not assigned to this property");
            }
            return tenant.getProperty();
        }
        return properties.findById(propertyId).orElseThrow();
    }

    private User payerFor(User actor, Property property, UUID requestedPayerId) {
        if (actor.getRoles().contains(Role.TENANT)) {
            return actor;
        }
        if (requestedPayerId != null) {
            return users.findById(requestedPayerId).orElseThrow();
        }
        return tenants.findByPropertyIdAndDeletedFalse(property.getId()).map(t -> t.getUser()).orElse(actor);
    }

    private Payment paymentVisibleToCurrent(UUID paymentId) {
        var pay = payments.findById(paymentId).orElseThrow();
        var actor = current.get();
        var ownerVisible = actor.getRoles().contains(Role.OWNER) && pay.getProperty().getOwner().getId().equals(actor.getId());
        var tenantVisible = actor.getRoles().contains(Role.TENANT) && pay.getPayer().getId().equals(actor.getId());
        if (!ownerVisible && !tenantVisible && !actor.getRoles().contains(Role.ADMIN)) {
            throw new IllegalArgumentException("Payment is not visible to current user");
        }
        return pay;
    }

    private BigDecimal lateFee(BigDecimal amount, LocalDate dueDate) {
        return dueDate.isBefore(LocalDate.now()) ? amount.multiply(new BigDecimal("0.02")) : BigDecimal.ZERO;
    }

    private void createInvoice(Payment payment) {
        var invoiceNumber = "VV-" + LocalDate.now().getYear() + "-" + payment.getId().toString().substring(0, 8).toUpperCase();
        invoices.save(Invoice.builder()
                .payment(payment)
                .invoiceNumber(invoiceNumber)
                .issuedDate(LocalDate.now())
                .dueDate(payment.getDueDate())
                .pdfUrl("/api/v1/invoices/" + payment.getId() + "/pdf")
                .build());
    }

    private void notify(User recipient, String title, String message) {
        notifications.save(Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .channel("IN_APP")
                .readFlag(false)
                .build());
    }

    private PaymentResponse map(Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getProperty().getId(),
                p.getProperty().getTitle(),
                p.getPayer().getFullName(),
                p.getType(),
                p.getStatus(),
                p.getAmount(),
                p.getLateFee(),
                p.getDueDate(),
                p.getGatewayOrderId(),
                p.getGatewayPaymentId(),
                p.getReceiptUrl(),
                upiIntent(p)
        );
    }

    private String upiIntent(Payment p) {
        var note = URLEncoder.encode("Veetu Vadagai " + p.getType() + " " + p.getProperty().getTitle(), StandardCharsets.UTF_8);
        return "upi://pay?pa=rent@veetuvadagai&pn=Veetu%20Vadagai&am=" + p.getAmount() + "&cu=INR&tn=" + note;
    }
}

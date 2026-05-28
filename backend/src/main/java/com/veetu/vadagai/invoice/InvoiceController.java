package com.veetu.vadagai.invoice;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.invoice.InvoiceDtos.InvoiceResponse;
import com.veetu.vadagai.user.CurrentUserService;
import com.veetu.vadagai.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceRepository invoices;
    private final CurrentUserService current;

    @GetMapping
    ApiResponse<List<InvoiceResponse>> list() {
        var user = current.get();
        var rows = (user.getRoles().contains(Role.OWNER) || user.getRoles().contains(Role.ADMIN))
                ? invoices.findByPaymentPropertyOwnerIdAndDeletedFalseOrderByIssuedDateDesc(user.getId())
                : invoices.findByPaymentPayerIdAndDeletedFalseOrderByIssuedDateDesc(user.getId());
        return ApiResponse.ok("Invoices", rows.stream().map(this::map).toList());
    }

    @GetMapping("/{paymentId}/pdf")
    ResponseEntity<byte[]> pdf(@PathVariable UUID paymentId) {
        var invoice = invoices.findByPaymentIdAndDeletedFalse(paymentId).orElseThrow();
        var user = current.get();
        var payment = invoice.getPayment();
        var ownerVisible = user.getRoles().contains(Role.OWNER) && payment.getProperty().getOwner().getId().equals(user.getId());
        var tenantVisible = user.getRoles().contains(Role.TENANT) && payment.getPayer().getId().equals(user.getId());
        if (!ownerVisible && !tenantVisible && !user.getRoles().contains(Role.ADMIN)) {
            throw new IllegalArgumentException("Invoice is not visible to current user");
        }
        var body = """
                Veetu Vadagai Receipt
                Invoice: %s
                Property: %s
                Tenant: %s
                Amount: Rs.%s
                Status: %s
                Due date: %s

                Thank you for using Veetu Vadagai.
                """.formatted(
                invoice.getInvoiceNumber(),
                invoice.getPayment().getProperty().getTitle(),
                invoice.getPayment().getPayer().getFullName(),
                invoice.getPayment().getAmount(),
                invoice.getPayment().getStatus(),
                invoice.getDueDate()
        ).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt-" + paymentId + ".txt")
                .contentType(MediaType.TEXT_PLAIN)
                .body(body);
    }

    private InvoiceResponse map(Invoice i) {
        return new InvoiceResponse(
                i.getId(),
                i.getPayment().getId(),
                i.getInvoiceNumber(),
                i.getPayment().getProperty().getTitle(),
                i.getPayment().getPayer().getFullName(),
                i.getPayment().getAmount(),
                i.getIssuedDate(),
                i.getDueDate(),
                i.getPdfUrl()
        );
    }
}

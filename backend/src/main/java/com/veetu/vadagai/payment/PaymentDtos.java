package com.veetu.vadagai.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class PaymentDtos {
    public record PaymentRequest(
            @NotNull UUID propertyId,
            UUID payerId,
            @NotNull PaymentType type,
            @NotNull @Positive BigDecimal amount,
            @NotNull LocalDate dueDate
    ) {
    }

    public record PaymentResponse(
            UUID id,
            UUID propertyId,
            String propertyTitle,
            String payerName,
            PaymentType type,
            PaymentStatus status,
            BigDecimal amount,
            BigDecimal lateFee,
            LocalDate dueDate,
            String gatewayOrderId,
            String gatewayPaymentId,
            String receiptUrl,
            String upiIntentUrl
    ) {
    }

    public record RazorpayWebhook(String orderId, String paymentId, String status, String signature) {
    }
}

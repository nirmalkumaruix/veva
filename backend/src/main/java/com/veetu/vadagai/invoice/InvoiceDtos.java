package com.veetu.vadagai.invoice;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class InvoiceDtos {
    public record InvoiceResponse(
            UUID id,
            UUID paymentId,
            String invoiceNumber,
            String propertyTitle,
            String payerName,
            BigDecimal amount,
            LocalDate issuedDate,
            LocalDate dueDate,
            String pdfUrl
    ) {
    }
}

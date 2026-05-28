package com.veetu.vadagai.agreement;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class AgreementDtos {
    public record AgreementRequest(
            @NotNull UUID propertyId,
            @NotNull UUID tenantId,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            String agreementPdfUrl
    ) {
    }

    public record AgreementResponse(
            UUID id,
            UUID propertyId,
            String propertyTitle,
            UUID tenantId,
            String tenantName,
            LocalDate startDate,
            LocalDate endDate,
            String agreementPdfUrl,
            boolean active
    ) {
    }
}

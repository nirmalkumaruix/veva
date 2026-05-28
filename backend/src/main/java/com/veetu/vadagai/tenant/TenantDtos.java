package com.veetu.vadagai.tenant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class TenantDtos {
    public record TenantRequest(
            @Email @NotBlank String email,
            @NotBlank String fullName,
            String mobile,
            @NotNull UUID propertyId,
            String emergencyContact,
            String kycDocumentUrl,
            LocalDate moveInDate
    ) {
    }

    public record TenantResponse(
            UUID id,
            UUID userId,
            String email,
            String fullName,
            String mobile,
            UUID propertyId,
            String propertyTitle,
            BigDecimal rentAmount,
            BigDecimal advanceAmount,
            String emergencyContact,
            String kycDocumentUrl,
            LocalDate moveInDate
    ) {
    }
}

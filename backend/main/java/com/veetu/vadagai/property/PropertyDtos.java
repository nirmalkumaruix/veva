package com.veetu.vadagai.property;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class PropertyDtos {
    public record PropertyRequest(
            @NotBlank String title,
            @NotNull PropertyType type,
            @NotBlank String addressLine1,
            String addressLine2,
            @NotBlank String city,
            @NotBlank String state,
            @NotBlank String postalCode,
            @NotNull @Positive BigDecimal rentAmount,
            @NotNull @Positive BigDecimal advanceAmount,
            @Min(1) @Max(28) int dueDay,
            boolean occupied
    ) {
    }

    public record PropertyResponse(
            UUID id,
            String title,
            PropertyType type,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String postalCode,
            BigDecimal rentAmount,
            BigDecimal advanceAmount,
            int dueDay,
            boolean occupied,
            List<PropertyImageResponse> images
    ) {
    }

    public record PropertyImageRequest(@NotBlank String url, String altText) {
    }

    public record PropertyImageResponse(UUID id, String url, String altText) {
    }
}

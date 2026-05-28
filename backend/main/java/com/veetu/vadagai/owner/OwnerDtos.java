package com.veetu.vadagai.owner;

import java.util.UUID;

public class OwnerDtos {
    public record OwnerProfileRequest(String businessName, String gstNumber, String payoutUpiId, String billingAddress, String logoUrl) {
    }

    public record OwnerProfileResponse(UUID id, String businessName, String gstNumber, String payoutUpiId, String billingAddress, String logoUrl) {
    }
}

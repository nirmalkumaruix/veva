package com.veetu.vadagai.owner;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.owner.OwnerDtos.OwnerProfileRequest;
import com.veetu.vadagai.owner.OwnerDtos.OwnerProfileResponse;
import com.veetu.vadagai.user.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/owners")
@RequiredArgsConstructor
public class OwnerController {
    private final OwnerProfileRepository repo;
    private final CurrentUserService current;

    @GetMapping("/me")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<OwnerProfileResponse> me() {
        return ApiResponse.ok("Owner profile", repo.findByUserIdAndDeletedFalse(current.get().getId()).map(this::map).orElse(null));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<OwnerProfileResponse> upsert(@RequestBody OwnerProfileRequest r) {
        var user = current.get();
        var profile = repo.findByUserIdAndDeletedFalse(user.getId()).orElseGet(() -> OwnerProfile.builder().user(user).build());
        profile.setBusinessName(r.businessName());
        profile.setGstNumber(r.gstNumber());
        profile.setPayoutUpiId(r.payoutUpiId());
        profile.setBillingAddress(r.billingAddress());
        profile.setLogoUrl(r.logoUrl());
        return ApiResponse.ok("Owner profile saved", map(repo.save(profile)));
    }

    private OwnerProfileResponse map(OwnerProfile p) {
        return new OwnerProfileResponse(p.getId(), p.getBusinessName(), p.getGstNumber(), p.getPayoutUpiId(), p.getBillingAddress(), p.getLogoUrl());
    }
}

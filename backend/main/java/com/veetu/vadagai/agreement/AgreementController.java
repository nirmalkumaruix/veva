package com.veetu.vadagai.agreement;

import com.veetu.vadagai.agreement.AgreementDtos.AgreementRequest;
import com.veetu.vadagai.agreement.AgreementDtos.AgreementResponse;
import com.veetu.vadagai.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agreements")
@RequiredArgsConstructor
public class AgreementController {
    private final AgreementService service;

    @GetMapping
    ApiResponse<List<AgreementResponse>> list() {
        return ApiResponse.ok("Agreements", service.mine());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<AgreementResponse> create(@Valid @RequestBody AgreementRequest r) {
        return ApiResponse.ok("Agreement saved", service.create(r));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<AgreementResponse> update(@PathVariable UUID id, @Valid @RequestBody AgreementRequest r) {
        return ApiResponse.ok("Agreement updated", service.update(id, r));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ApiResponse.ok("Agreement deleted", null);
    }
}

package com.veetu.vadagai.tenant;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.tenant.TenantDtos.TenantRequest;
import com.veetu.vadagai.tenant.TenantDtos.TenantResponse;
import com.veetu.vadagai.user.CurrentUserService;
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
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {
    private final TenantService svc;
    private final CurrentUserService current;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<List<TenantResponse>> list() {
        return ApiResponse.ok("Tenants", svc.ownerTenants(current.get().getId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    ApiResponse<TenantResponse> me() {
        return ApiResponse.ok("Tenant profile", svc.me());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<TenantResponse> add(@Valid @RequestBody TenantRequest r) {
        return ApiResponse.ok("Tenant added", svc.add(r));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<TenantResponse> update(@PathVariable UUID id, @Valid @RequestBody TenantRequest r) {
        return ApiResponse.ok("Tenant updated", svc.update(id, r));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<Void> delete(@PathVariable UUID id) {
        svc.delete(id);
        return ApiResponse.ok("Tenant removed", null);
    }
}

package com.veetu.vadagai.tenant;

import com.veetu.vadagai.property.PropertyRepository;
import com.veetu.vadagai.tenant.TenantDtos.TenantRequest;
import com.veetu.vadagai.tenant.TenantDtos.TenantResponse;
import com.veetu.vadagai.user.CurrentUserService;
import com.veetu.vadagai.user.Role;
import com.veetu.vadagai.user.User;
import com.veetu.vadagai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {
    private final TenantRepository tenants;
    private final UserRepository users;
    private final PropertyRepository properties;
    private final PasswordEncoder encoder;
    private final CurrentUserService current;

    @Transactional
    public TenantResponse add(TenantRequest r) {
        var owner = current.get();
        var property = properties.findByIdAndOwnerIdAndDeletedFalse(r.propertyId(), owner.getId()).orElseThrow();
        var user = users.findByEmailIgnoreCaseAndDeletedFalse(r.email())
                .orElseGet(() -> users.save(User.builder()
                        .email(r.email().toLowerCase())
                        .fullName(r.fullName())
                        .mobile(r.mobile())
                        .passwordHash(encoder.encode("Tenant@12345"))
                        .roles(Set.of(Role.TENANT))
                        .emailVerified(true)
                        .build()));

        user.setFullName(r.fullName());
        user.setMobile(r.mobile());
        user.getRoles().add(Role.TENANT);

        var profile = tenants.findByUserEmailIgnoreCaseAndDeletedFalse(r.email())
                .orElseGet(() -> TenantProfile.builder().user(user).build());
        profile.setProperty(property);
        profile.setEmergencyContact(r.emergencyContact());
        profile.setKycDocumentUrl(r.kycDocumentUrl());
        profile.setMoveInDate(r.moveInDate());
        profile.setDeleted(false);
        property.setOccupied(true);
        return map(tenants.save(profile));
    }

    public List<TenantResponse> ownerTenants(UUID ownerId) {
        return tenants.findByPropertyOwnerIdAndDeletedFalse(ownerId).stream().map(this::map).toList();
    }

    public TenantResponse me() {
        return tenants.findByUserIdAndDeletedFalse(current.get().getId()).map(this::map).orElseThrow();
    }

    @Transactional
    public TenantResponse update(UUID id, TenantRequest r) {
        var tenant = tenants.findByIdAndPropertyOwnerIdAndDeletedFalse(id, current.get().getId()).orElseThrow();
        tenant.getUser().setFullName(r.fullName());
        tenant.getUser().setMobile(r.mobile());
        tenant.setEmergencyContact(r.emergencyContact());
        tenant.setKycDocumentUrl(r.kycDocumentUrl());
        tenant.setMoveInDate(r.moveInDate());
        if (!tenant.getProperty().getId().equals(r.propertyId())) {
            var property = properties.findByIdAndOwnerIdAndDeletedFalse(r.propertyId(), current.get().getId()).orElseThrow();
            tenant.getProperty().setOccupied(false);
            property.setOccupied(true);
            tenant.setProperty(property);
        }
        return map(tenant);
    }

    @Transactional
    public void delete(UUID id) {
        var tenant = tenants.findByIdAndPropertyOwnerIdAndDeletedFalse(id, current.get().getId()).orElseThrow();
        tenant.setDeleted(true);
        tenant.getProperty().setOccupied(false);
    }

    TenantResponse map(TenantProfile t) {
        return new TenantResponse(
                t.getId(),
                t.getUser().getId(),
                t.getUser().getEmail(),
                t.getUser().getFullName(),
                t.getUser().getMobile(),
                t.getProperty().getId(),
                t.getProperty().getTitle(),
                t.getProperty().getRentAmount(),
                t.getProperty().getAdvanceAmount(),
                t.getEmergencyContact(),
                t.getKycDocumentUrl(),
                t.getMoveInDate()
        );
    }
}

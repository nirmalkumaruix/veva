package com.veetu.vadagai.agreement;

import com.veetu.vadagai.agreement.AgreementDtos.AgreementRequest;
import com.veetu.vadagai.agreement.AgreementDtos.AgreementResponse;
import com.veetu.vadagai.property.PropertyRepository;
import com.veetu.vadagai.tenant.TenantRepository;
import com.veetu.vadagai.user.CurrentUserService;
import com.veetu.vadagai.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgreementService {
    private final AgreementRepository agreements;
    private final PropertyRepository properties;
    private final TenantRepository tenants;
    private final CurrentUserService current;

    public List<AgreementResponse> mine() {
        var user = current.get();
        var rows = user.getRoles().contains(Role.TENANT)
                ? agreements.findByTenantUserIdAndDeletedFalse(user.getId())
                : agreements.findByPropertyOwnerIdAndDeletedFalse(user.getId());
        return rows.stream().map(this::map).toList();
    }

    @Transactional
    public AgreementResponse create(AgreementRequest r) {
        var owner = current.get();
        var property = properties.findByIdAndOwnerIdAndDeletedFalse(r.propertyId(), owner.getId()).orElseThrow();
        var tenant = tenants.findByIdAndPropertyOwnerIdAndDeletedFalse(r.tenantId(), owner.getId()).orElseThrow();
        if (!tenant.getProperty().getId().equals(property.getId())) {
            throw new IllegalArgumentException("Tenant is not assigned to the selected property");
        }
        var agreement = agreements.save(RentalAgreement.builder()
                .property(property)
                .tenant(tenant)
                .startDate(r.startDate())
                .endDate(r.endDate())
                .agreementPdfUrl(r.agreementPdfUrl())
                .build());
        return map(agreement);
    }

    @Transactional
    public AgreementResponse update(UUID id, AgreementRequest r) {
        var agreement = agreements.findByIdAndPropertyOwnerIdAndDeletedFalse(id, current.get().getId()).orElseThrow();
        agreement.setStartDate(r.startDate());
        agreement.setEndDate(r.endDate());
        agreement.setAgreementPdfUrl(r.agreementPdfUrl());
        return map(agreement);
    }

    @Transactional
    public void delete(UUID id) {
        var agreement = agreements.findByIdAndPropertyOwnerIdAndDeletedFalse(id, current.get().getId()).orElseThrow();
        agreement.setDeleted(true);
    }

    private AgreementResponse map(RentalAgreement a) {
        var now = LocalDate.now();
        return new AgreementResponse(
                a.getId(),
                a.getProperty().getId(),
                a.getProperty().getTitle(),
                a.getTenant().getId(),
                a.getTenant().getUser().getFullName(),
                a.getStartDate(),
                a.getEndDate(),
                a.getAgreementPdfUrl(),
                !now.isBefore(a.getStartDate()) && !now.isAfter(a.getEndDate())
        );
    }
}

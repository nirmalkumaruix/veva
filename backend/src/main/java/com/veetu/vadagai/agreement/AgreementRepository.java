package com.veetu.vadagai.agreement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgreementRepository extends JpaRepository<RentalAgreement, UUID> {
    List<RentalAgreement> findByPropertyOwnerIdAndDeletedFalse(UUID ownerId);

    List<RentalAgreement> findByTenantUserIdAndDeletedFalse(UUID tenantUserId);

    Optional<RentalAgreement> findByIdAndPropertyOwnerIdAndDeletedFalse(UUID id, UUID ownerId);
}

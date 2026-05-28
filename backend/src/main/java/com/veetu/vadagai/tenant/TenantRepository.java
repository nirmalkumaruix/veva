package com.veetu.vadagai.tenant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<TenantProfile, UUID> {
    long countByDeletedFalse();

    long countByPropertyOwnerIdAndDeletedFalse(UUID ownerId);

    List<TenantProfile> findByPropertyOwnerIdAndDeletedFalse(UUID ownerId);

    Optional<TenantProfile> findByIdAndPropertyOwnerIdAndDeletedFalse(UUID id, UUID ownerId);

    Optional<TenantProfile> findByUserEmailIgnoreCaseAndDeletedFalse(String email);

    Optional<TenantProfile> findByUserIdAndDeletedFalse(UUID userId);

    Optional<TenantProfile> findByPropertyIdAndDeletedFalse(UUID propertyId);
}

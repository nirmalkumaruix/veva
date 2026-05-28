package com.veetu.vadagai.property;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    Page<Property> findByOwnerIdAndDeletedFalse(UUID ownerId, Pageable p);

    List<Property> findByOwnerIdAndDeletedFalse(UUID ownerId);

    Optional<Property> findByIdAndOwnerIdAndDeletedFalse(UUID id, UUID ownerId);

    long countByDeletedFalse();

    long countByOwnerIdAndDeletedFalse(UUID ownerId);

    long countByOccupiedTrueAndDeletedFalse();

    long countByOwnerIdAndOccupiedTrueAndDeletedFalse(UUID ownerId);
}

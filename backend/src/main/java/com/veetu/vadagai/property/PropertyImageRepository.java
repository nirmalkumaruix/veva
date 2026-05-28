package com.veetu.vadagai.property;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PropertyImageRepository extends JpaRepository<PropertyImage, UUID> {
    List<PropertyImage> findByPropertyIdAndDeletedFalse(UUID propertyId);

    Optional<PropertyImage> findByIdAndPropertyOwnerIdAndDeletedFalse(UUID id, UUID ownerId);
}

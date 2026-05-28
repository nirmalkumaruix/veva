package com.veetu.vadagai.owner;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OwnerProfileRepository extends JpaRepository<OwnerProfile, UUID> {
    Optional<OwnerProfile> findByUserIdAndDeletedFalse(UUID userId);
}

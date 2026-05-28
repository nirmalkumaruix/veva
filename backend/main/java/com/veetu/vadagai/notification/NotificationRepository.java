package com.veetu.vadagai.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findTop50ByRecipientIdAndDeletedFalseOrderByCreatedAtDesc(UUID id);

    Optional<Notification> findByIdAndRecipientIdAndDeletedFalse(UUID id, UUID recipientId);

    long countByRecipientIdAndReadFlagFalseAndDeletedFalse(UUID recipientId);
}

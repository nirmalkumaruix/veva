package com.veetu.vadagai.notification;

import java.time.Instant;
import java.util.UUID;

public class NotificationDtos {
    public record NotificationResponse(
            UUID id,
            String title,
            String message,
            String channel,
            boolean readFlag,
            Instant createdAt
    ) {
    }
}

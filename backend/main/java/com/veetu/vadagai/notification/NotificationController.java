package com.veetu.vadagai.notification;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.notification.NotificationDtos.NotificationResponse;
import com.veetu.vadagai.user.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationRepository repo;
    private final CurrentUserService current;

    @GetMapping
    ApiResponse<List<NotificationResponse>> mine() {
        var user = current.get();
        return ApiResponse.ok("Notifications", repo.findTop50ByRecipientIdAndDeletedFalseOrderByCreatedAtDesc(user.getId()).stream().map(this::map).toList());
    }

    @GetMapping("/unread-count")
    ApiResponse<Map<String, Long>> unread() {
        return ApiResponse.ok("Unread notifications", Map.of("count", repo.countByRecipientIdAndReadFlagFalseAndDeletedFalse(current.get().getId())));
    }

    @PatchMapping("/{id}/read")
    ApiResponse<NotificationResponse> read(@PathVariable UUID id) {
        var n = repo.findByIdAndRecipientIdAndDeletedFalse(id, current.get().getId()).orElseThrow();
        n.setReadFlag(true);
        return ApiResponse.ok("Notification read", map(repo.save(n)));
    }

    private NotificationResponse map(Notification n) {
        return new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.getChannel(), n.isReadFlag(), n.getCreatedAt());
    }
}

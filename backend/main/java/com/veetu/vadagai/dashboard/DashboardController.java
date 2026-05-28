package com.veetu.vadagai.dashboard;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.payment.PaymentRepository;
import com.veetu.vadagai.payment.PaymentStatus;
import com.veetu.vadagai.property.PropertyRepository;
import com.veetu.vadagai.tenant.TenantRepository;
import com.veetu.vadagai.user.CurrentUserService;
import com.veetu.vadagai.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final PropertyRepository properties;
    private final TenantRepository tenants;
    private final PaymentRepository payments;
    private final UserRepository users;
    private final CurrentUserService current;

    @GetMapping("/owner")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<Map<String, Object>> owner() {
        var owner = current.get();
        long total = properties.countByOwnerIdAndDeletedFalse(owner.getId());
        long occupied = properties.countByOwnerIdAndOccupiedTrueAndDeletedFalse(owner.getId());
        var recentPayments = payments.findTop10ByPropertyOwnerIdAndDeletedFalseOrderByCreatedAtDesc(owner.getId()).stream()
                .map(p -> Map.of(
                        "id", p.getId(),
                        "propertyTitle", p.getProperty().getTitle(),
                        "payerName", p.getPayer().getFullName(),
                        "amount", p.getAmount(),
                        "status", p.getStatus(),
                        "dueDate", p.getDueDate()
                ))
                .toList();
        return ApiResponse.ok("Owner analytics", Map.of(
                "totalProperties", total,
                "occupied", occupied,
                "vacant", Math.max(0, total - occupied),
                "totalTenants", tenants.countByPropertyOwnerIdAndDeletedFalse(owner.getId()),
                "pendingRents", payments.pendingDuesByOwner(owner.getId()),
                "monthlyRevenue", payments.totalRevenueByOwner(owner.getId()),
                "collectionRate", collectionRate(owner.getId()),
                "recentPayments", recentPayments
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<Map<String, Object>> admin() {
        return ApiResponse.ok("Admin analytics", Map.of(
                "users", users.countByDeletedFalse(),
                "properties", properties.countByDeletedFalse(),
                "payments", payments.count(),
                "revenue", payments.totalRevenue(),
                "pendingDues", payments.pendingDues()
        ));
    }

    @GetMapping("/tenant")
    @PreAuthorize("hasRole('TENANT')")
    ApiResponse<Map<String, Object>> tenant() {
        var user = current.get();
        var profile = tenants.findByUserIdAndDeletedFalse(user.getId()).orElseThrow();
        var pending = payments.pendingDuesByPayer(user.getId());
        return ApiResponse.ok("Tenant summary", Map.of(
                "status", pending.compareTo(BigDecimal.ZERO) > 0 ? "DUE" : "CURRENT",
                "nextDueDate", nextDueDate(profile.getProperty().getDueDay()),
                "nextDueInDays", Math.max(0, LocalDate.now().until(nextDueDate(profile.getProperty().getDueDay())).getDays()),
                "pendingAmount", pending,
                "propertyTitle", profile.getProperty().getTitle(),
                "rentAmount", profile.getProperty().getRentAmount(),
                "advanceAmount", profile.getProperty().getAdvanceAmount()
        ));
    }

    private int collectionRate(java.util.UUID ownerId) {
        var recent = payments.findTop10ByPropertyOwnerIdAndDeletedFalseOrderByCreatedAtDesc(ownerId);
        if (recent.isEmpty()) {
            return 100;
        }
        long success = recent.stream().filter(p -> p.getStatus() == PaymentStatus.SUCCESS).count();
        return (int) Math.round((success * 100.0) / recent.size());
    }

    private LocalDate nextDueDate(int dueDay) {
        var now = LocalDate.now();
        var thisMonth = LocalDate.of(now.getYear(), now.getMonth(), Math.min(dueDay, now.lengthOfMonth()));
        if (!thisMonth.isBefore(now)) {
            return thisMonth;
        }
        var next = now.plusMonths(1);
        return LocalDate.of(next.getYear(), next.getMonth(), Math.min(dueDay, next.lengthOfMonth()));
    }
}

package com.veetu.vadagai.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    @Query("select coalesce(sum(p.amount),0) from Payment p where p.status='SUCCESS' and p.deleted=false")
    BigDecimal totalRevenue();

    @Query("select coalesce(sum(p.amount),0) from Payment p where p.property.owner.id=:ownerId and p.status='SUCCESS' and p.deleted=false")
    BigDecimal totalRevenueByOwner(@Param("ownerId") UUID ownerId);

    @Query("select coalesce(sum(p.amount),0) from Payment p where p.status in ('PENDING','CREATED') and p.deleted=false")
    BigDecimal pendingDues();

    @Query("select coalesce(sum(p.amount),0) from Payment p where p.property.owner.id=:ownerId and p.status in ('PENDING','CREATED') and p.deleted=false")
    BigDecimal pendingDuesByOwner(@Param("ownerId") UUID ownerId);

    @Query("select coalesce(sum(p.amount),0) from Payment p where p.payer.id=:tenantId and p.status in ('PENDING','CREATED') and p.deleted=false")
    BigDecimal pendingDuesByPayer(@Param("tenantId") UUID tenantId);

    Page<Payment> findByPayerIdAndDeletedFalse(UUID payerId, Pageable pageable);

    Page<Payment> findByPropertyOwnerIdAndDeletedFalse(UUID ownerId, Pageable pageable);

    List<Payment> findTop10ByPropertyOwnerIdAndDeletedFalseOrderByCreatedAtDesc(UUID ownerId);

    Optional<Payment> findByGatewayOrderIdAndDeletedFalse(String gatewayOrderId);
}

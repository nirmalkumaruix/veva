package com.veetu.vadagai.invoice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByPaymentPayerIdAndDeletedFalseOrderByIssuedDateDesc(UUID payerId);

    List<Invoice> findByPaymentPropertyOwnerIdAndDeletedFalseOrderByIssuedDateDesc(UUID ownerId);

    Optional<Invoice> findByPaymentIdAndDeletedFalse(UUID paymentId);
}

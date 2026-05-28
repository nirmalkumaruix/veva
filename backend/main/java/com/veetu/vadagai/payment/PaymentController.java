package com.veetu.vadagai.payment;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.payment.PaymentDtos.PaymentRequest;
import com.veetu.vadagai.payment.PaymentDtos.PaymentResponse;
import com.veetu.vadagai.payment.PaymentDtos.RazorpayWebhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService svc;

    @GetMapping
    ApiResponse<Page<PaymentResponse>> mine(@PageableDefault(size = 20) Pageable p) {
        return ApiResponse.ok("Payments", svc.mine(p));
    }

    @PostMapping
    ApiResponse<PaymentResponse> create(@Valid @RequestBody PaymentRequest r) {
        return ApiResponse.ok("Razorpay order created", svc.create(r));
    }

    @PatchMapping("/{id}/success")
    ApiResponse<PaymentResponse> success(@PathVariable UUID id) {
        return ApiResponse.ok("Payment marked successful", svc.markSuccess(id));
    }

    @PatchMapping("/{id}/refund")
    ApiResponse<PaymentResponse> refund(@PathVariable UUID id) {
        return ApiResponse.ok("Refund recorded", svc.refund(id));
    }

    @PostMapping("/{id}/reminders")
    ApiResponse<PaymentResponse> remind(@PathVariable UUID id) {
        return ApiResponse.ok("Reminder sent", svc.remind(id));
    }

    @PostMapping("/razorpay/webhook")
    ApiResponse<PaymentResponse> webhook(@RequestBody RazorpayWebhook w) {
        return ApiResponse.ok("Payment synced", svc.webhook(w));
    }
}

package com.veetu.vadagai.user;

import com.veetu.vadagai.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository users;
    private final CurrentUserService current;
    private final PasswordEncoder encoder;

    record Me(UUID id, String email, String fullName, String mobile, Set<Role> roles) {
    }

    record ProfileRequest(@NotBlank String fullName, String mobile) {
    }

    record PasswordRequest(@NotBlank String currentPassword, @NotBlank @Size(min = 8) String newPassword) {
    }

    @GetMapping("/me")
    ApiResponse<Me> me() {
        return ApiResponse.ok("Profile", map(current.get()));
    }

    @PatchMapping("/me")
    ApiResponse<Me> update(@Valid @RequestBody ProfileRequest r) {
        var u = current.get();
        u.setFullName(r.fullName());
        u.setMobile(r.mobile());
        return ApiResponse.ok("Profile updated", map(users.save(u)));
    }

    @PatchMapping("/me/password")
    ApiResponse<Void> password(@Valid @RequestBody PasswordRequest r) {
        var u = current.get();
        if (!encoder.matches(r.currentPassword(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        u.setPasswordHash(encoder.encode(r.newPassword()));
        users.save(u);
        return ApiResponse.ok("Password changed", null);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<Me>> list() {
        return ApiResponse.ok("Users", users.findAll().stream().filter(u -> !u.isDeleted()).map(this::map).toList());
    }

    private Me map(User u) {
        return new Me(u.getId(), u.getEmail(), u.getFullName(), u.getMobile(), u.getRoles());
    }
}

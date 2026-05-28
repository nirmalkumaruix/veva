package com.veetu.vadagai.common;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Map<String, String>>> validation(MethodArgumentNotValidException ex) {
        var errors = ex.getBindingResult().getFieldErrors().stream().collect(Collectors.toMap(
                e -> e.getField(),
                e -> e.getDefaultMessage() == null ? "Invalid" : e.getDefaultMessage(),
                (a, b) -> a
        ));
        return ResponseEntity.badRequest().body(ApiResponse.fail("Validation failed", errors));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiResponse<Void>> auth(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.fail("Invalid email or password", null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> forbidden(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.fail("Access denied", null));
    }

    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class, NoSuchElementException.class})
    ResponseEntity<ApiResponse<Void>> bad(Exception ex) {
        return ResponseEntity.badRequest().body(ApiResponse.fail(ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> err(Exception ex) {
        log.error("Unhandled API error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.fail("Unexpected server error", null));
    }
}

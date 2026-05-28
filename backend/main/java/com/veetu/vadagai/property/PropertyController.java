package com.veetu.vadagai.property;

import com.veetu.vadagai.common.ApiResponse;
import com.veetu.vadagai.property.PropertyDtos.PropertyImageRequest;
import com.veetu.vadagai.property.PropertyDtos.PropertyImageResponse;
import com.veetu.vadagai.property.PropertyDtos.PropertyRequest;
import com.veetu.vadagai.property.PropertyDtos.PropertyResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
public class PropertyController {
    private final PropertyService svc;

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<Page<PropertyResponse>> list(@PageableDefault(size = 12) Pageable p) {
        return ApiResponse.ok("Properties", svc.mine(p));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<List<PropertyResponse>> all() {
        return ApiResponse.ok("Properties", svc.mineList());
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<PropertyResponse> create(@Valid @RequestBody PropertyRequest r) {
        return ApiResponse.ok("Property created", svc.create(r));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<PropertyResponse> update(@PathVariable UUID id, @Valid @RequestBody PropertyRequest r) {
        return ApiResponse.ok("Property updated", svc.update(id, r));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<Void> delete(@PathVariable UUID id) {
        svc.delete(id);
        return ApiResponse.ok("Property deleted", null);
    }

    @GetMapping("/{propertyId}/images")
    @PreAuthorize("hasAnyRole('OWNER','ADMIN')")
    ApiResponse<List<PropertyImageResponse>> images(@PathVariable UUID propertyId) {
        return ApiResponse.ok("Property images", svc.images(propertyId));
    }

    @PostMapping("/{propertyId}/images")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<PropertyImageResponse> addImage(@PathVariable UUID propertyId, @Valid @RequestBody PropertyImageRequest r) {
        return ApiResponse.ok("Image added", svc.addImage(propertyId, r));
    }

    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('OWNER')")
    ApiResponse<Void> deleteImage(@PathVariable UUID imageId) {
        svc.deleteImage(imageId);
        return ApiResponse.ok("Image deleted", null);
    }
}

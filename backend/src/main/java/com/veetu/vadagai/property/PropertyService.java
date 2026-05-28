package com.veetu.vadagai.property;

import com.veetu.vadagai.property.PropertyDtos.PropertyImageRequest;
import com.veetu.vadagai.property.PropertyDtos.PropertyImageResponse;
import com.veetu.vadagai.property.PropertyDtos.PropertyRequest;
import com.veetu.vadagai.property.PropertyDtos.PropertyResponse;
import com.veetu.vadagai.user.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyRepository repo;
    private final PropertyImageRepository images;
    private final CurrentUserService current;

    @Transactional
    public PropertyResponse create(PropertyRequest r) {
        var p = Property.builder()
                .owner(current.get())
                .title(r.title())
                .type(r.type())
                .addressLine1(r.addressLine1())
                .addressLine2(r.addressLine2())
                .city(r.city())
                .state(r.state())
                .postalCode(r.postalCode())
                .rentAmount(r.rentAmount())
                .advanceAmount(r.advanceAmount())
                .dueDay(r.dueDay())
                .occupied(r.occupied())
                .build();
        return map(repo.save(p));
    }

    public Page<PropertyResponse> mine(Pageable p) {
        var user = current.get();
        return repo.findByOwnerIdAndDeletedFalse(user.getId(), p).map(this::map);
    }

    public List<PropertyResponse> mineList() {
        var user = current.get();
        return repo.findByOwnerIdAndDeletedFalse(user.getId()).stream().map(this::map).toList();
    }

    @Transactional
    public PropertyResponse update(UUID id, PropertyRequest r) {
        var p = propertyForCurrentOwner(id);
        p.setTitle(r.title());
        p.setType(r.type());
        p.setAddressLine1(r.addressLine1());
        p.setAddressLine2(r.addressLine2());
        p.setCity(r.city());
        p.setState(r.state());
        p.setPostalCode(r.postalCode());
        p.setRentAmount(r.rentAmount());
        p.setAdvanceAmount(r.advanceAmount());
        p.setDueDay(r.dueDay());
        p.setOccupied(r.occupied());
        return map(p);
    }

    @Transactional
    public void delete(UUID id) {
        var p = propertyForCurrentOwner(id);
        p.setDeleted(true);
    }

    @Transactional
    public PropertyImageResponse addImage(UUID propertyId, PropertyImageRequest r) {
        var p = propertyForCurrentOwner(propertyId);
        var image = images.save(PropertyImage.builder().property(p).url(r.url()).altText(r.altText()).build());
        return mapImage(image);
    }

    public List<PropertyImageResponse> images(UUID propertyId) {
        propertyForCurrentOwner(propertyId);
        return images.findByPropertyIdAndDeletedFalse(propertyId).stream().map(this::mapImage).toList();
    }

    @Transactional
    public void deleteImage(UUID imageId) {
        var image = images.findByIdAndPropertyOwnerIdAndDeletedFalse(imageId, current.get().getId()).orElseThrow();
        image.setDeleted(true);
    }

    Property propertyForCurrentOwner(UUID propertyId) {
        return repo.findByIdAndOwnerIdAndDeletedFalse(propertyId, current.get().getId()).orElseThrow();
    }

    private PropertyResponse map(Property p) {
        return new PropertyResponse(
                p.getId(),
                p.getTitle(),
                p.getType(),
                p.getAddressLine1(),
                p.getAddressLine2(),
                p.getCity(),
                p.getState(),
                p.getPostalCode(),
                p.getRentAmount(),
                p.getAdvanceAmount(),
                p.getDueDay(),
                p.isOccupied(),
                images.findByPropertyIdAndDeletedFalse(p.getId()).stream().map(this::mapImage).toList()
        );
    }

    private PropertyImageResponse mapImage(PropertyImage image) {
        return new PropertyImageResponse(image.getId(), image.getUrl(), image.getAltText());
    }
}

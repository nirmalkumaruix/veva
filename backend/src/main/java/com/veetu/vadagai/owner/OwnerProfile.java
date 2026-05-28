package com.veetu.vadagai.owner;

import com.veetu.vadagai.common.BaseEntity;
import com.veetu.vadagai.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerProfile extends BaseEntity {
    @OneToOne(optional = false)
    private User user;

    private String businessName;
    private String gstNumber;
    private String payoutUpiId;
    private String billingAddress;

    @Column(length = 1000)
    private String logoUrl;
}

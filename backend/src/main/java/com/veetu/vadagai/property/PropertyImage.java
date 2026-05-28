package com.veetu.vadagai.property;import com.veetu.vadagai.common.BaseEntity;import jakarta.persistence.*;import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder public class PropertyImage extends BaseEntity{ @ManyToOne(optional=false) private Property property; @Column(nullable=false) private String url; private String altText; }

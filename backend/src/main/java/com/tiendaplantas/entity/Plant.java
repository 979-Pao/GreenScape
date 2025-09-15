package com.tiendaplantas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "plants", indexes = {
        @Index(name = "idx_plant_sci", columnList = "scientificName"),
        @Index(name = "idx_plant_common", columnList = "commonName"),
        @Index(name = "idx_plant_category", columnList = "category")
})
@Getter @Setter @NoArgsConstructor
public class Plant extends BaseEntity {

  @NotBlank
  private String scientificName;

  @NotBlank
  private String commonName;

  // alias/compat con tu código previo
  private String name;

  @Column(length = 1000)
  private String description;

  private String category;

  @NotNull
  private BigDecimal price;

  @Column(nullable = false)
  private Integer stock = 0;

  @ManyToOne(fetch = FetchType.LAZY)
  private User supplier;

  // Concurrencia optimista (evita sobreventa al descontar stock)
  @Version
  private Long version;

  @CreatedDate
  @Column(updatable = false)
  private Instant createdAt;

  @LastModifiedDate
  private Instant updatedAt;
}
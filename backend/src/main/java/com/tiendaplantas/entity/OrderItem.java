package com.tiendaplantas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity @Getter @Setter @NoArgsConstructor
public class OrderItem extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY) private Order orderRef;
  @ManyToOne(fetch = FetchType.EAGER) private Plant plant;
  private Integer quantity;
  private BigDecimal unitPrice;
}

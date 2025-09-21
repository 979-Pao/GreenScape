package com.tiendaplantas.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity @Getter @Setter @NoArgsConstructor
@Table(name = "orders")
public class Order extends BaseEntity {
  @ManyToOne(fetch = FetchType.LAZY) private User customer;

  @Enumerated(EnumType.STRING)
  private OrderStatus status = OrderStatus.CART;

 @OneToMany(mappedBy = "orderRef", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
 private List<OrderItem> items = new ArrayList<>();

  public BigDecimal getTotal() {
    return items.stream()
            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  @Enumerated(EnumType.STRING)
  private OrderType type = OrderType.CUSTOMER;  // default
  // (opcional pero útil): proveedor ligado al pedido de compra
  @ManyToOne
  private User supplier; // solo para PURCHASE

}

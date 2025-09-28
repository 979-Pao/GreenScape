package com.tiendaplantas.controller;

import com.tiendaplantas.dto.OrderDtos.*;
import com.tiendaplantas.entity.User;
import com.tiendaplantas.repository.UserRepository;
import com.tiendaplantas.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orders;
  private final UserRepository users;

  public OrderController(OrderService orders, UserRepository users) {
    this.orders = orders;
    this.users = users;
  }

  // ========================= CLIENTE: CARRITO / HISTORIAL =========================

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @GetMapping("/cart")
  public OrderDto myCart(Authentication auth) {
    return orders.getCart(auth.getName());
  }

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @PostMapping("/cart/add")
  public OrderDto addToCart(Authentication auth, @RequestBody AddItemDto dto) {
    return orders.addToCart(auth.getName(), dto.getPlantId(), dto.getQuantity());
  }

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @DeleteMapping("/cart/items/{itemId}")
  public OrderDto removeFromCart(Authentication auth, @PathVariable Long itemId) {
    return orders.removeFromCart(auth.getName(), itemId);
  }

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @PostMapping("/cart/checkout")
  public OrderDto checkout(Authentication auth) {
    return orders.checkout(auth.getName());
  }

  @PreAuthorize("hasRole('CLIENT')")
  @GetMapping("/cart/history")
  public List<OrderDto> myOrders(Authentication auth) {
    return orders.myOrders(auth.getName());
  }

  // ========================= SUPPLIER =========================

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/supplier/mine")
  public List<OrderDto> supplierOrders(Authentication auth) {
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return orders.findOrdersForSupplier(me.getId());
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/supplier/inbox")
  public List<OrderDto> supplierInbox(Authentication auth) {
    Long supplierId = users.findByEmail(auth.getName()).orElseThrow().getId();
    return orders.supplierInbox(supplierId);
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @PostMapping("/supplier/{id}/accept")
  public OrderDto acceptPurchaseLegacy(Authentication auth, @PathVariable Long id) {
    Long supplierId = users.findByEmail(auth.getName()).orElseThrow().getId();
    return orders.acceptPurchase(id, supplierId);
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @PostMapping("/supplier/{id}/complete")
  public OrderDto completePurchaseLegacy(Authentication auth, @PathVariable Long id) {
    Long supplierId = users.findByEmail(auth.getName()).orElseThrow().getId();
    return orders.completePurchase(id, supplierId);
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/supplier/kpis")
  public Map<String, Long> supplierKpis(Authentication auth) {
    var me = users.findByEmail(auth.getName()).orElseThrow();
    var list = orders.listPurchasesForSupplier(me.getId());
    long pending = list.stream().filter(o -> "NEW".equals(o.getStatus())).count();
    long accepted = list.stream().filter(o -> "ACCEPTED".equals(o.getStatus())).count();
    long openThreads = pending + accepted; 
    return Map.of(
        "pending", pending,
        "todayAssigned", 0L,          
        "openThreads", openThreads
    );
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/supplier/purchases")
  public List<OrderDto> supplierPurchases(Authentication auth) {
    var me = users.findByEmail(auth.getName()).orElseThrow();
    return orders.listPurchasesForSupplier(me.getId());
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @PutMapping("/supplier/purchases/{id}/accept")
  public OrderDto acceptPurchase(Authentication auth, @PathVariable Long id) {
    var me = users.findByEmail(auth.getName()).orElseThrow();
    return orders.acceptPurchase(id, me.getId());
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @PutMapping("/supplier/purchases/{id}/complete")
  public OrderDto completePurchase(Authentication auth, @PathVariable Long id) {
    var me = users.findByEmail(auth.getName()).orElseThrow();
    return orders.completePurchase(id, me.getId());
  }
}

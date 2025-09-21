package com.tiendaplantas.controller;

import com.tiendaplantas.dto.OrderDtos.*;
import com.tiendaplantas.dto.PurchaseDtos;
import com.tiendaplantas.entity.*;
import com.tiendaplantas.repository.UserRepository;
import com.tiendaplantas.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  private final OrderService orders;
  private final UserRepository users;

  public OrderController(OrderService orders, UserRepository users) {
    this.orders = orders; this.users = users;
  }

  // -------- CLIENT: Carrito personal --------
  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @GetMapping("/cart")
  public OrderDto myCart(Authentication auth){
    return orders.getCart(auth.getName());
  }

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @PostMapping("/cart/add")
  public OrderDto addToCart(Authentication auth, @RequestBody AddItemDto dto){
    return orders.addToCart(auth.getName(), dto.getPlantId(), dto.getQuantity());
  }

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @DeleteMapping("/cart/items/{itemId}")
  public OrderDto removeFromCart(Authentication auth, @PathVariable Long itemId){
    return orders.removeFromCart(auth.getName(), itemId);
  }

  @PreAuthorize("hasAnyRole('CLIENT','ADMIN','SUPPLIER')")
  @PostMapping("/cart/checkout")
  public OrderDto checkout(Authentication auth){
    return orders.checkout(auth.getName());
  }

  @PreAuthorize("hasRole('CLIENT')")
  @GetMapping("/cart/history")
  public List<OrderDto> myOrders(Authentication auth){
  return orders.myOrders(auth.getName());
  }

  // -------- SUPPLIER: Ver pedidos de sus plantas --------
  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/supplier/mine")
  public List<OrderDto> supplierOrders(Authentication auth){
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return orders.findOrdersForSupplier(me.getId());
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/supplier/inbox")
  public List<OrderDto> supplierInbox(Authentication auth){
    Long supplierId = users.findByEmail(auth.getName()).orElseThrow().getId();
    return orders.supplierInbox(supplierId);
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @PostMapping("/supplier/{id}/accept")
  public OrderDto acceptPurchase(Authentication auth, @PathVariable Long id){
    Long supplierId = users.findByEmail(auth.getName()).orElseThrow().getId();
    return orders.acceptPurchase(id, supplierId);
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @PostMapping("/supplier/{id}/complete")
  public OrderDto completePurchase(Authentication auth, @PathVariable Long id){
    Long supplierId = users.findByEmail(auth.getName()).orElseThrow().getId();
    return orders.completePurchase(id, supplierId);
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/purchase/mine")
  public List<OrderDto> myPurchases(Authentication auth) {
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return orders.listPurchasesForSupplier(me.getId());
  }

  // -------- ADMIN: Ver todos los pedidos --------
  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping
  public List<OrderDto> listCustomerOrders() {
    return orders.listCustomerOrders();
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/purchase")
  public List<OrderDto> listPurchases() {
    return orders.listPurchases();
  }

  // ===== ADMIN: crear pedido de compra =====
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/purchase")
  public OrderDto createPurchase(Authentication auth,
                                 @RequestBody PurchaseDtos.CreatePurchaseRequest req) {
    // No pasamos adminEmail, el service lo obtiene del SecurityContext
    return orders.createPurchaseOrder(req.getSupplierId(), req.getItems());
  }

 
}
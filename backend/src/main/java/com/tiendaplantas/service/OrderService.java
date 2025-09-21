package com.tiendaplantas.service;

import com.tiendaplantas.dto.OrderDtos.*;
import com.tiendaplantas.dto.PurchaseDtos;
import com.tiendaplantas.entity.*;
import com.tiendaplantas.repository.OrderItemRepository;
import com.tiendaplantas.repository.OrderRepository;
import com.tiendaplantas.repository.PlantRepository;
import com.tiendaplantas.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderService {
  private static final Logger log = LoggerFactory.getLogger(OrderService.class);
  private final OrderRepository orders;
  private final OrderItemRepository items;
  private final UserRepository users;
  private final PlantRepository plants;

  public OrderService(OrderRepository orders,
                      OrderItemRepository items,
                      UserRepository users,
                      PlantRepository plants) {
    this.orders = orders;
    this.items = items;
    this.users = users;
    this.plants = plants;
  }

  // ======= API usada por el Controller =======

  public OrderDto getCart(String customerEmail){
    Order cart = getOrCreateCart(customerEmail);
    return toDto(cart);
  }

  // ✅ ESTE ES addToCart (antes tenías un checkout mal pegado)
  public OrderDto addToCart(String email, Long plantId, int qty){
    if (qty <= 0) qty = 1;

    Order cart = getOrCreateCart(email);
    if (cart.getItems() == null) cart.setItems(new ArrayList<>());

    Plant plant = plants.findById(plantId).orElseThrow();

    // si ya existe línea, acumula; si no, crea nueva
    OrderItem line = cart.getItems().stream()
        .filter(i -> i.getPlant().getId().equals(plantId))
        .findFirst()
        .orElseGet(() -> {
          OrderItem it = new OrderItem();
          it.setOrderRef(cart);
          it.setPlant(plant);
          it.setQuantity(0);
          it.setUnitPrice(plant.getPrice());
          cart.getItems().add(it);
          return it;
        });

    line.setQuantity(line.getQuantity() + qty);

    orders.save(cart);
    return toDto(cart);
  }

  public OrderDto removeFromCart(String email, Long itemId){
    Order cart = getOrCreateCart(email);
    if (cart.getItems() != null) {
      cart.getItems().removeIf(i -> i.getId().equals(itemId));
    }
    items.deleteById(itemId);
    orders.save(cart);
    return toDto(cart);
  }

  // ✅ ÚNICO checkout (deja solo este)
  public OrderDto checkout(String email){
    Order cart = getOrCreateCart(email);
    var itemsList = (cart.getItems() == null) ? List.<OrderItem>of() : cart.getItems();
    if (itemsList.isEmpty()) return toDto(cart);

    // Validar y descontar stock
    itemsList.forEach(it -> {
      Plant plant = plants.findById(it.getPlant().getId()).orElseThrow();
      int q = it.getQuantity();
      if (plant.getStock() == null || plant.getStock() < q) {
        log.warn("⚠️ Sin stock: plantId={}, requested={}, available={}",
                 plant.getId(), q, plant.getStock());
        throw new IllegalStateException("Sin stock para: " + plant.getCommonName());
      }
      plant.setStock(plant.getStock() - q);
      plants.save(plant);
    });

    cart.setType(OrderType.CUSTOMER);  
    cart.setStatus(OrderStatus.PAID);
    if (cart.getCreatedAt() == null) cart.setCreatedAt(Instant.now());
    orders.save(cart);

    // nuevo carrito vacío
    Order newCart = new Order();
    newCart.setCustomer(cart.getCustomer());
    newCart.setStatus(OrderStatus.CART);
    newCart.setType(OrderType.CUSTOMER);
    newCart.setItems(new ArrayList<>()); // 👈 evita NPE si la entidad no inicializa
    orders.save(newCart);

    return toDto(cart); // devolvemos el pedido pagado
  }

  // ADMIN crea un pedido de compra a un proveedor
  public OrderDto createPurchaseOrder(Long supplierId,
      List<PurchaseDtos.CreatePurchaseRequest.Item> itemsReq) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getName() == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated admin");
    }
    String adminEmail = auth.getName();
    User admin = users.findByEmail(adminEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found: " + adminEmail));

    User supplier = users.findById(supplierId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: id=" + supplierId));
    if (itemsReq == null || itemsReq.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Items list is empty");
    }

    Order po = new Order();
    po.setType(OrderType.PURCHASE);
    po.setStatus(OrderStatus.NEW);
    po.setSupplier(supplier);
    po.setCustomer(admin);

    for (var itReq : itemsReq) {
      Plant plant = plants.findById(itReq.getPlantId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plant not found: id=" + itReq.getPlantId()));
      if (plant.getSupplier() == null || !plant.getSupplier().getId().equals(supplierId)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Plant " + plant.getId() + " does not belong to supplier " + supplierId);
      }
      OrderItem it = new OrderItem();
      it.setOrderRef(po);
      it.setPlant(plant);
      it.setQuantity(Math.max(1, itReq.getQuantity()));
      it.setUnitPrice(plant.getPrice());
      po.getItems().add(it);
    }

    orders.save(po);
    log.info("📦 PO#{} NEW creado por {} (id={}) para supplier {} (id={}), items={}",
        po.getId(), admin.getEmail(), admin.getId(), supplier.getEmail(), supplier.getId(), po.getItems().size());

    return toDto(po);
  }

  public List<OrderDto> supplierInbox(Long supplierId) {
    return orders.findBySupplier_IdAndType(supplierId, OrderType.PURCHASE)
        .stream().map(this::toDto).toList();
  }

  public OrderDto acceptPurchase(Long orderId, Long supplierId) {
    Order po = orders.findById(orderId).orElseThrow();
    validateSupplierOwnership(po, supplierId);
    if (po.getStatus() != OrderStatus.NEW) throw new IllegalStateException("Solo pedidos NEW pueden aceptarse");
    po.setStatus(OrderStatus.ACCEPTED);
    orders.save(po);
    log.info("✅ PO {} aceptado por supplierId={}", orderId, supplierId);
    return toDto(po);
  }

  public OrderDto completePurchase(Long orderId, Long supplierId) {
    Order po = orders.findById(orderId).orElseThrow();
    validateSupplierOwnership(po, supplierId);
    if (po.getStatus() != OrderStatus.ACCEPTED) throw new IllegalStateException("Solo pedidos ACCEPTED pueden completarse");
    po.setStatus(OrderStatus.COMPLETED);
    orders.save(po);
    log.info("🏁 PO {} completado por supplierId={}", orderId, supplierId);
    return toDto(po);
  }

  private void validateSupplierOwnership(Order po, Long supplierId){
    if (po.getType() != OrderType.PURCHASE) throw new IllegalArgumentException("No es un pedido de compra");
    if (po.getSupplier()==null || !po.getSupplier().getId().equals(supplierId)) {
      throw new SecurityException("Pedido no pertenece a este proveedor");
    }
  }

  public List<OrderDto> findOrdersForSupplier(Long supplierId){
    List<Order> list = orders.findDistinctByItems_Plant_Supplier_Id(supplierId);
    return list.stream().map(this::toDto).toList();
  }

  public List<OrderDto> findAll(){
    return orders.findAll().stream().map(this::toDto).toList();
  }

  public List<OrderDto> myOrders(String email){
  User u = users.findByEmail(email).orElseThrow();
  return orders.findByCustomerAndTypeOrderByCreatedAtDesc(u, OrderType.CUSTOMER)
      .stream()
      .filter(o -> o.getStatus() != OrderStatus.CART) // fuera el carrito
      .map(this::toDto)
      .toList();
  }

  public List<OrderDto> listCustomerOrders(){ // ADMIN
  return orders.findByTypeAndStatusNotOrderByCreatedAtDesc(OrderType.CUSTOMER, OrderStatus.CART)
      .stream()
      .map(this::toDto)
      .toList();
  }

  public List<OrderDto> listPurchases() {
    return orders.findByType(OrderType.PURCHASE).stream().map(this::toDto).toList();
  }

  public List<OrderDto> listPurchasesForSupplier(Long supplierId) {
    return orders.findBySupplier_IdAndType(supplierId, OrderType.PURCHASE)
        .stream().map(this::toDto).toList();
  }

  // ======= Helpers =======

  private Order getOrCreateCart(String email){
    User u = users.findByEmail(email).orElseThrow();
    return orders.findByCustomerAndStatus(u, OrderStatus.CART).orElseGet(() -> {
      Order o = new Order();
      o.setCustomer(u);
      o.setStatus(OrderStatus.CART);
      o.setItems(new ArrayList<>());  // 👈 evita NPE si la entidad no inicializa
      return orders.save(o);
    });
  }

  // MAPPER: order -> DTO
  private OrderDto toDto(Order o){
    var items = (o.getItems() == null) ? List.<OrderItem>of() : o.getItems();
    var itemDtos = items.stream().map(this::toItemDto).toList();
    var total = itemDtos.stream().map(OrderItemDto::getLineTotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    String created = o.getCreatedAt() != null ? o.getCreatedAt().toString() : null;

    Long customerId   = (o.getCustomer() != null ? o.getCustomer().getId()   : null);
    String customerNm = (o.getCustomer() != null ? o.getCustomer().getName() : null);

    OrderDto dto = new OrderDto(
        o.getId(),
        o.getStatus().name(),
        itemDtos,
        total,
        created,
        customerId
    );
    dto.setCustomerName(customerNm);
    return dto;
  }

  private OrderItemDto toItemDto(OrderItem it){
    BigDecimal lineTotal = it.getUnitPrice().multiply(BigDecimal.valueOf(it.getQuantity()));
    return new OrderItemDto(
        it.getId(),
        it.getPlant().getId(),
        it.getPlant().getScientificName(),
        it.getPlant().getCommonName(),
        it.getUnitPrice(),
        it.getQuantity(),
        lineTotal
    );
  }
}

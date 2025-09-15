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
import java.time.OffsetDateTime;
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

  public OrderDto addToCart(String customerEmail, Long plantId, int qty){
    if (qty <= 0) qty = 1;
    Order cart = getOrCreateCart(customerEmail);
    Plant plant = plants.findById(plantId).orElseThrow();

    // si ya existe línea, acumula cantidad; si no, crea nueva
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

  public OrderDto removeFromCart(String customerEmail, Long itemId){
    Order cart = getOrCreateCart(customerEmail);
    cart.getItems().removeIf(i -> i.getId().equals(itemId));
    items.deleteById(itemId);
    orders.save(cart);
    return toDto(cart);
  }

  public OrderDto checkout(String customerEmail){
    Order cart = getOrCreateCart(customerEmail);
    if (cart.getItems().isEmpty()) return toDto(cart);

    // Validar y descontar stock (optimistic locking por @Version en Plant)
    cart.getItems().forEach(it -> {
      Plant plant = plants.findById(it.getPlant().getId()).orElseThrow();
      int qty = it.getQuantity();
      if (plant.getStock() == null || plant.getStock() < qty) {
        log.warn("⚠️ Sin stock: plantId={}, requested={}, available={}",
                plant.getId(), qty, plant.getStock());
        throw new IllegalStateException("Sin stock para: " + plant.getCommonName());
      }
      plant.setStock(plant.getStock() - qty);
      plants.save(plant); // si hay colisión de concurrente, Spring lanzará OptimisticLockingFailureException
    });

    cart.setStatus(OrderStatus.PAID);
    if (cart.getCreatedAt() == null) cart.setCreatedAt(Instant.now()); // <--- aquí el cambio
    orders.save(cart);

    // Crea nuevo carrito vacío para el cliente
    Order newCart = new Order();
    newCart.setCustomer(cart.getCustomer());
    newCart.setStatus(OrderStatus.CART);
    orders.save(newCart);

    return toDto(cart); // devolvemos el pedido pagado
  }

  // ADMIN crea un pedido de compra a un proveedor
  public OrderDto createPurchaseOrder(Long supplierId,
                                      List<PurchaseDtos.CreatePurchaseRequest.Item> itemsReq) {

    // 1) Obtener admin autenticado
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || auth.getName() == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated admin");
    }
    String adminEmail = auth.getName();
    User admin = users.findByEmail(adminEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found: " + adminEmail));

    // 2) Validar supplier e items
    User supplier = users.findById(supplierId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found: id=" + supplierId));
    if (itemsReq == null || itemsReq.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Items list is empty");
    }

    // 3) Crear PO y setear el admin como "customer"
    Order po = new Order();
    po.setType(OrderType.PURCHASE);
    po.setStatus(OrderStatus.NEW);
    po.setSupplier(supplier);
    po.setCustomer(admin); // ← AQUÍ VA

    // 4) Construir líneas
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

  // SUPPLIER: listar sus pedidos de compra
  public List<OrderDto> supplierInbox(Long supplierId) {
    return orders.findBySupplier_IdAndType(supplierId, OrderType.PURCHASE)
            .stream().map(this::toDto).toList();
    // o findDistinctByItems_Plant_Supplier_IdAndType(...) si no guardas supplier en Order
  }

  // SUPPLIER: aceptar pedido
  public OrderDto acceptPurchase(Long orderId, Long supplierId) {
    Order po = orders.findById(orderId).orElseThrow();
    validateSupplierOwnership(po, supplierId);
    if (po.getStatus() != OrderStatus.NEW) throw new IllegalStateException("Solo pedidos NEW pueden aceptarse");
    po.setStatus(OrderStatus.ACCEPTED);
    orders.save(po);
    log.info("✅ PO {} aceptado por supplierId={}", orderId, supplierId);
    return toDto(po);
  }

  // SUPPLIER: completar pedido
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

  // Pedidos que contienen plantas del supplier autenticado
  public List<OrderDto> findOrdersForSupplier(Long supplierId){
    List<Order> list = orders.findDistinctByItems_Plant_Supplier_Id(supplierId);
    return list.stream().map(this::toDto).toList();
  }

  public List<OrderDto> findAll(){
    return orders.findAll().stream().map(this::toDto).toList();
  }

  public List<OrderDto> listCustomerOrders() {
    return orders.findByType(OrderType.CUSTOMER).stream().map(this::toDto).toList();
  }

  public List<OrderDto> listPurchases() {
    return orders.findByType(OrderType.PURCHASE).stream().map(this::toDto).toList();
  }

  public List<OrderDto> listPurchasesForSupplier(Long supplierId) {
    return orders.findBySupplier_IdAndType(supplierId, OrderType.PURCHASE)
            .stream().map(this::toDto).toList();
    // Alternativa si no tienes order.supplier:
    // return orders.findDistinctByItems_Plant_Supplier_IdAndType(supplierId, OrderType.PURCHASE)
    //              .stream().map(this::toDto).toList();
  }

  // ======= Helpers =======

  private Order getOrCreateCart(String email){
    User u = users.findByEmail(email).orElseThrow();
    return orders.findByCustomerAndStatus(u, OrderStatus.CART).orElseGet(() -> {
      Order o = new Order();
      o.setCustomer(u);
      o.setStatus(OrderStatus.CART);
      return orders.save(o);
    });
  }

  // MAPPER: order -> DTO  (PÉGALO AQUÍ)
  private OrderDto toDto(Order o){
    var itemDtos = o.getItems().stream().map(this::toItemDto).toList();
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
    dto.setCustomerName(customerNm); // <- para que salga "Admin", "Paola", etc.
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
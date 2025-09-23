package com.tiendaplantas.controller;

import com.tiendaplantas.dto.BlogDtos;
import com.tiendaplantas.dto.PlantDtos;
import com.tiendaplantas.dto.UserDtos;
import com.tiendaplantas.dto.PurchaseDtos;
import com.tiendaplantas.dto.OrderDtos.OrderDto;

import com.tiendaplantas.entity.*;
import com.tiendaplantas.repository.BlogPostRepository;
import com.tiendaplantas.repository.OrderRepository;
import com.tiendaplantas.repository.PlantRepository;
import com.tiendaplantas.repository.UserRepository;
import com.tiendaplantas.service.OrderService;
import com.tiendaplantas.service.PlantService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

  private final PlantService plants;
  private final PlantRepository plantRepo;
  private final UserRepository users;
  private final BlogPostRepository posts;
  private final OrderRepository orderRepo;
  private final OrderService orders;
  private final PasswordEncoder enc;

  public AdminController(
      PlantService plants,
      PlantRepository plantRepo,
      UserRepository users,
      BlogPostRepository posts,
      OrderRepository orderRepo,
      OrderService orders,
      PasswordEncoder enc
  ) {
    this.plants = plants;
    this.plantRepo = plantRepo;
    this.users = users;
    this.posts = posts;
    this.orderRepo = orderRepo;
    this.orders = orders;
    this.enc = enc;
  }

  // ========= Helpers DTO =========
  private static PlantDtos.Resp toResp(Plant p) {
    return new PlantDtos.Resp(
        p.getId(), p.getScientificName(), p.getCommonName(), p.getName(),
        p.getDescription(), p.getCategory(), p.getPrice(), p.getStock(),
        p.getSupplier() != null ? p.getSupplier().getId() : null
    );
  }

  private static BlogDtos.Resp toResp(BlogPost p) {
    return new BlogDtos.Resp(
        p.getId(), p.getTitle(), p.getSlug(), p.getContent(), p.getStatus(),
        p.getCreatedAt() != null ? p.getCreatedAt().toString() : null,
        p.getAuthor() != null ? p.getAuthor().getId() : null
    );
  }

  private static UserDtos.Resp toResp(User u) {
    return new UserDtos.Resp(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getPhone());
  }

  private static String sanitizeSlug(String s) {
    String base = s == null ? "" : s.trim().toLowerCase();
    base = base.replaceAll("[^a-z0-9\\s-]", "");
    base = base.replaceAll("\\s+", "-");
    base = base.replaceAll("-{2,}", "-");
    return base.replaceAll("^-|-$", "");
  }

  // =========================================================
  // REPORTES
  // =========================================================
  @GetMapping("/reports/overview")
  public Map<String, Object> overview() {
    long totalUsers = users.count();
    long totalPlants = plantRepo.count();

    var allOrders = orderRepo.findAll();
    long totalOrders = allOrders.size();

    // Estados que computan ingresos de cliente
    var revenueStatuses = EnumSet.of(OrderStatus.PAID, OrderStatus.SHIPPED);

    // Calcular total desde items (por si Order no expone getTotal())
    java.util.function.Function<Order, BigDecimal> calcTotal = o -> {
      if (o.getItems() == null) return BigDecimal.ZERO;
      return o.getItems().stream()
          .map(it -> it.getUnitPrice().multiply(BigDecimal.valueOf(it.getQuantity())))
          .reduce(BigDecimal.ZERO, BigDecimal::add);
    };

    BigDecimal totalRevenue = allOrders.stream()
        .filter(o -> o.getType() == OrderType.CUSTOMER)
        .filter(o -> revenueStatuses.contains(o.getStatus()))
        .map(calcTotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    Instant start = LocalDate.now(ZoneOffset.UTC).atStartOfDay(ZoneOffset.UTC).toInstant();
    Instant end = start.plus(1, ChronoUnit.DAYS);

    BigDecimal todayRevenue = allOrders.stream()
        .filter(o -> o.getType() == OrderType.CUSTOMER)
        .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(start) && o.getCreatedAt().isBefore(end))
        .filter(o -> revenueStatuses.contains(o.getStatus()))
        .map(calcTotal)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    long pendingOrders = allOrders.stream()
        .filter(o -> o.getType() == OrderType.CUSTOMER)
        .filter(o -> o.getStatus() == OrderStatus.PAID)
        .count();

    long openPurchases = allOrders.stream()
        .filter(o -> o.getType() == OrderType.PURCHASE)
        .filter(o -> o.getStatus() == OrderStatus.NEW || o.getStatus() == OrderStatus.ACCEPTED)
        .count();

    long lowStock = plantRepo.findAll().stream()
        .filter(p -> p.getStock() != null && p.getStock() <= 5)
        .count();

    return Map.of(
        "totalUsers", totalUsers,
        "totalPlants", totalPlants,
        "totalOrders", totalOrders,
        "totalRevenue", totalRevenue,
        "todayRevenue", todayRevenue,
        "pendingOrders", pendingOrders,
        "openPurchases", openPurchases,
        "lowStock", lowStock
    );
  }

  // =========================================================
  // PLANTS
  // =========================================================
  @GetMapping("/plants")
  public List<PlantDtos.Resp> listPlants(@RequestParam(name = "q", required = false) String q) {
    return plantRepo.findAll().stream()
        .filter(p -> q == null || q.isBlank() ||
            Stream.of(p.getName(), p.getCommonName(), p.getScientificName(), p.getCategory())
                .filter(Objects::nonNull)
                .anyMatch(s -> s.toLowerCase().contains(q.toLowerCase())))
        .map(AdminController::toResp)
        .toList();
  }

  @PostMapping("/plants")
  public PlantDtos.Resp createPlant(@Valid @RequestBody PlantDtos.Create dto) {
    Plant p = new Plant();
    p.setScientificName(dto.getScientificName());
    p.setCommonName(dto.getCommonName());
    p.setName(dto.getName());
    p.setDescription(dto.getDescription());
    p.setCategory(dto.getCategory());
    p.setPrice(dto.getPrice());
    p.setStock(dto.getStock());
    if (dto.getSupplierId() != null) {
      p.setSupplier(users.findById(dto.getSupplierId()).orElseThrow());
    }
    plants.save(p);
    return toResp(p);
  }

  @PutMapping("/plants/{id}")
  public PlantDtos.Resp updatePlant(@PathVariable Long id, @RequestBody PlantDtos.Update dto) {
    Plant p = plants.get(id);
    if (dto.getScientificName() != null) p.setScientificName(dto.getScientificName());
    if (dto.getCommonName() != null) p.setCommonName(dto.getCommonName());
    if (dto.getName() != null) p.setName(dto.getName());
    if (dto.getDescription() != null) p.setDescription(dto.getDescription());
    if (dto.getCategory() != null) p.setCategory(dto.getCategory());
    if (dto.getPrice() != null) p.setPrice(dto.getPrice());
    if (dto.getStock() != null) p.setStock(dto.getStock());
    if (dto.getSupplierId() != null) p.setSupplier(users.findById(dto.getSupplierId()).orElseThrow());
    plants.save(p);
    return toResp(p);
  }

  @DeleteMapping("/plants/{id}")
  public ResponseEntity<Void> deletePlant(@PathVariable Long id) {
    // Si quieres bloquear borrado con relaciones, descomenta y ajusta:
    // if (orderRepo.existsByItems_Plant_Id(id)) throw new ResponseStatusException(HttpStatus.CONFLICT, "La planta está asociada a pedidos");
    plants.delete(id);
    return ResponseEntity.noContent().build();
  }

  // =========================================================
  // USERS
  // =========================================================
  @GetMapping("/users")
  public List<UserDtos.Summary> listUsers(@RequestParam(name = "role", required = false) Role role) {
    Stream<User> stream = users.findAll().stream();
    if (role != null) stream = stream.filter(u -> u.getRole() == role);
    return stream
        .map(u -> new UserDtos.Summary(u.getId(), u.getName(), u.getEmail(), u.getRole().name()))
        .toList();
  }

  @GetMapping("/users/{id}")
  public UserDtos.Resp getUser(@PathVariable Long id) {
    return toResp(users.findById(id).orElseThrow());
  }

  @PostMapping("/users")
  public UserDtos.Resp createUser(@Valid @RequestBody UserDtos.Create dto) {
    if (users.findByEmail(dto.getEmail()).isPresent())
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya existe");
    User u = new User();
    u.setName(dto.getName());
    u.setEmail(dto.getEmail());
    u.setPassword(enc.encode(dto.getPassword()));
    u.setRole(dto.getRole());
    u.setPhone(dto.getPhone());
    users.save(u);
    return toResp(u);
  }

  @PutMapping("/users/{id}")
  public UserDtos.Resp updateUser(@PathVariable Long id, @RequestBody UserDtos.Update dto) {
    User u = users.findById(id).orElseThrow();
    if (dto.getName() != null) u.setName(dto.getName());
    if (dto.getPhone() != null) u.setPhone(dto.getPhone());
    if (dto.getRole() != null) u.setRole(dto.getRole());
    if (dto.getPassword() != null && !dto.getPassword().isBlank())
      u.setPassword(enc.encode(dto.getPassword()));
    users.save(u);
    return toResp(u);
  }

  @PutMapping("/users/me")
  public UserDtos.Resp updateMe(Authentication auth, @RequestBody UserDtos.Update dto) {
    User u = users.findByEmail(auth.getName()).orElseThrow();
    if (dto.getName() != null) u.setName(dto.getName());
    if (dto.getPhone() != null) u.setPhone(dto.getPhone());
    if (dto.getPassword() != null && !dto.getPassword().isBlank())
      u.setPassword(enc.encode(dto.getPassword()));
    users.save(u);
    return toResp(u);
  }

  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    User u = users.findById(id).orElseThrow();
    if (u.getRole() == Role.SUPPLIER &&
        (plantRepo.existsBySupplier_Id(id) || orderRepo.existsBySupplier_Id(id))) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El proveedor tiene plantas o compras asociadas");
    }
    if (u.getRole() == Role.CLIENT && orderRepo.existsByCustomer_Id(id)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El cliente tiene pedidos asociados");
    }
    users.delete(u);
    return ResponseEntity.noContent().build();
  }

  // =========================================================
  // BLOG
  // =========================================================
  @GetMapping("/blog")
  public List<BlogDtos.Resp> listAllPosts() {
    return posts.findAll().stream().map(AdminController::toResp).toList();
  }

  @GetMapping("/blog/{id}")
  public BlogDtos.Resp getPost(@PathVariable Long id) {
    return toResp(posts.findById(id).orElseThrow());
  }

  @PostMapping("/blog")
  public BlogDtos.Resp createPost(Authentication auth, @Valid @RequestBody BlogDtos.Create dto) {
    User admin = users.findByEmail(auth.getName()).orElseThrow();
    String slug = (dto.getSlug() != null && !dto.getSlug().isBlank())
        ? sanitizeSlug(dto.getSlug())
        : sanitizeSlug(dto.getTitle());
    if (posts.existsBySlug(slug))
      throw new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya existe");
    BlogPost p = new BlogPost();
    p.setTitle(dto.getTitle());
    p.setSlug(slug);
    p.setContent(dto.getContent());
    p.setStatus(dto.getStatus() != null ? dto.getStatus() : PostStatus.DRAFT);
    p.setAuthor(admin);
    posts.save(p);
    return toResp(p);
  }

  @PutMapping("/blog/{id}")
  public BlogDtos.Resp updatePost(@PathVariable Long id, @RequestBody BlogDtos.Update dto) {
    BlogPost p = posts.findById(id).orElseThrow();
    if (dto.getTitle() != null) p.setTitle(dto.getTitle());
    if (dto.getContent() != null) p.setContent(dto.getContent());
    if (dto.getStatus() != null) p.setStatus(dto.getStatus());
    if (dto.getSlug() != null) {
      String slug = sanitizeSlug(dto.getSlug());
      boolean existsDup = posts.existsBySlug(slug) && !slug.equalsIgnoreCase(p.getSlug());
      if (existsDup) throw new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya existe");
      p.setSlug(slug);
    }
    posts.save(p);
    return toResp(p);
  }

  @DeleteMapping("/blog/{id}")
  public ResponseEntity<Void> deletePost(@PathVariable Long id) {
    BlogPost p = posts.findById(id).orElseThrow();
    posts.delete(p);
    return ResponseEntity.noContent().build();
  }

  // =========================================================
  // ORDERS (ADMIN)
  // =========================================================

  // --- Ventas a clientes ---
  @GetMapping("/orders")
  public List<OrderDto> listCustomerOrders() {
    return orders.listCustomerOrders();
  }

  @GetMapping("/orders/{id}")
  public OrderDto getCustomerOrder(@PathVariable Long id) {
    return orders.adminGetCustomerOrder(id);
  }

  // PUT /api/admin/orders/{id}/status?status=SHIPPED|CANCELED (desde PAID)
  @PutMapping("/orders/{id}/status")
  public OrderDto updateCustomerOrderStatus(
      @PathVariable Long id,
      @RequestParam("status") OrderStatus status
  ) {
    // Solo permitimos transiciones que valida el servicio (PAID → SHIPPED|CANCELED)
    return orders.adminUpdateCustomerStatus(id, status);
  }

  // --- Compras a proveedores (PO) ---
  @GetMapping("/orders/purchases")
  public List<OrderDto> listPurchases() {
    return orders.listPurchases();
  }

  @PostMapping("/orders/purchases")
  public OrderDto createPurchase(@RequestBody PurchaseDtos.CreatePurchaseRequest req) {
    return orders.createPurchaseOrder(req.getSupplierId(), req.getItems());
  }

  // PUT /api/admin/orders/purchases/{id}/status?status=NEW|ACCEPTED|COMPLETED|CANCELED
  @PutMapping("/orders/purchases/{id}/status")
  public OrderDto updatePurchaseStatus(
      @PathVariable Long id,
      @RequestParam("status") OrderStatus status
  ) {
    return orders.adminUpdatePurchaseStatus(id, status);
  }

  @DeleteMapping("/orders/purchases/{id}")
  public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
    orders.adminDeletePurchase(id);
    return ResponseEntity.noContent().build();
  }
}

package com.tiendaplantas.controller;

import com.tiendaplantas.dto.PlantDtos.PlantRequest;
import com.tiendaplantas.dto.PlantDtos.PlantResponse;
import com.tiendaplantas.entity.Plant;
import com.tiendaplantas.entity.User;
import com.tiendaplantas.repository.UserRepository;
import com.tiendaplantas.service.PlantService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plants")
public class PlantController {
  private final PlantService plants;
  private final UserRepository users;

  public PlantController(PlantService plants, UserRepository users) {
    this.plants = plants; this.users = users;
  }

  // ---------- Helpers ----------
  private static PlantResponse toResp(Plant p){
    return new PlantResponse(
            p.getId(),
            p.getScientificName(),
            p.getCommonName(),
            p.getDescription(),
            p.getCategory(),
            p.getPrice(),
            p.getStock(),
            p.getSupplier() != null ? p.getSupplier().getId() : null
    );
  }

  // ---------- Públicos ----------
  @GetMapping
  public List<PlantResponse> all(){
    return plants.all().stream().map(PlantController::toResp).collect(Collectors.toList());
  }

  @GetMapping("/{id}")
  public PlantResponse get(@PathVariable Long id){
    return toResp(plants.get(id));
  }

  @GetMapping("/search")
  public List<PlantResponse> search(@RequestParam(name = "query", required = false, defaultValue = "") String query) {
    return plants.search(query).stream().map(PlantController::toResp).toList();
  }

  @GetMapping("/page/advanced")
  public org.springframework.data.domain.Page<PlantResponse> listAdvanced(
          @RequestParam(name="q", required=false) String q,
          @RequestParam(name="category", required=false) String category,
          @RequestParam(name="priceMin", required=false) java.math.BigDecimal priceMin,
          @RequestParam(name="priceMax", required=false) java.math.BigDecimal priceMax,
          @RequestParam(name="inStock", required=false) Boolean inStock,
          org.springframework.data.domain.Pageable pageable){
    return plants.listAdvanced(q, category, priceMin, priceMax, inStock, pageable)
            .map(PlantController::toResp);
  }

  // ---------- NUEVOS PÚBLICOS (PAGINADOS: Page<>) ----------
  // GET /api/plants/page?page=0&size=12&sort=price,asc&q=monstera
  @GetMapping("/page")
  public Page<PlantResponse> listPaged(@RequestParam(name = "q", required = false) String q,
                                       Pageable pageable){
    return plants.listPaged(q, pageable).map(PlantController::toResp);
  }

  // ---------- SUPPLIER (LEGACY y PAGINADO) ----------
  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/mine")
  public List<PlantResponse> mine(Authentication auth){
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return plants.bySupplier(me.getId()).stream().map(PlantController::toResp).toList();
  }

  // GET /api/plants/mine/page?page=0&size=8&sort=scientificName,asc
  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/mine/page")
  public Page<PlantResponse> minePaged(Authentication auth, Pageable pageable){
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return plants.bySupplierPaged(me.getId(), pageable).map(PlantController::toResp);
  }


  // ---------- Solo ADMIN ----------
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public PlantResponse create(@Valid @RequestBody PlantRequest req){
    Plant p = new Plant();
    p.setScientificName(req.getScientificName());
    p.setCommonName(req.getCommonName());
    p.setName(req.getScientificName()); // alias compat
    p.setDescription(req.getDescription());
    p.setCategory(req.getCategory());
    p.setPrice(req.getPrice());
    p.setStock(req.getStock());
    if (req.getSupplierId() != null) {
      User s = users.findById(req.getSupplierId()).orElseThrow();
      p.setSupplier(s);
    }
    return toResp(plants.save(p));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{id}")
  public PlantResponse update(@PathVariable Long id, @RequestBody PlantRequest req){
    Plant p = plants.get(id);
    if (req.getScientificName()!=null){ p.setScientificName(req.getScientificName()); p.setName(req.getScientificName()); }
    if (req.getCommonName()!=null) p.setCommonName(req.getCommonName());
    if (req.getDescription()!=null) p.setDescription(req.getDescription());
    if (req.getCategory()!=null) p.setCategory(req.getCategory());
    if (req.getPrice()!=null) p.setPrice(req.getPrice());
    if (req.getStock()!=null) p.setStock(req.getStock());
    if (req.getSupplierId()!=null){
      User s = users.findById(req.getSupplierId()).orElseThrow();
      p.setSupplier(s);
    }
    return toResp(plants.save(p));
  }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id){
    plants.delete(id);
    return ResponseEntity.noContent().build();
  }
}
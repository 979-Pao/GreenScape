package com.tiendaplantas.controller;

import com.tiendaplantas.dto.PlantDtos;
import com.tiendaplantas.dto.PlantDtos.Resp;
import com.tiendaplantas.entity.Plant;
import com.tiendaplantas.entity.User;
import com.tiendaplantas.repository.UserRepository;
import com.tiendaplantas.service.PlantService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/plants")
public class PlantController {
  private final PlantService plants;
  private final UserRepository users;

  public PlantController(PlantService plants, UserRepository users) {
    this.plants = plants; this.users = users;
  }

  private static PlantDtos.Resp toResp(Plant p) {
    return new PlantDtos.Resp(
      p.getId(), p.getScientificName(), p.getCommonName(), p.getName(),
      p.getDescription(), p.getCategory(), p.getPrice(), p.getStock(),
      p.getSupplier()!=null ? p.getSupplier().getId() : null
    );
  }

  // Públicos
  @GetMapping public List<Resp> all() {
    return plants.all().stream().map(PlantController::toResp).toList();
  }
  @GetMapping("/{id}") public Resp get(@PathVariable Long id) { return toResp(plants.get(id)); }

  @GetMapping("/search")
  public List<Resp> search(@RequestParam(name="q", required=false) String q,
                           @RequestParam(name="query", required=false) String query) {
    String term = (q!=null && !q.isBlank()) ? q : (query!=null ? query : "");
    return plants.search(term).stream().map(PlantController::toResp).toList();
  }

  @GetMapping("/page")
  public Page<Resp> listPaged(@RequestParam(name="q", required=false) String q, Pageable pageable) {
    return plants.listPaged(q, pageable).map(PlantController::toResp);
  }

  @GetMapping("/page/advanced")
  public Page<Resp> listAdvanced(@RequestParam(name="q", required=false) String q,
                                 @RequestParam(name="category", required=false) String category,
                                 @RequestParam(name="priceMin", required=false) BigDecimal priceMin,
                                 @RequestParam(name="priceMax", required=false) BigDecimal priceMax,
                                 @RequestParam(name="inStock", required=false) Boolean inStock,
                                 Pageable pageable) {
    return plants.listAdvanced(q, category, priceMin, priceMax, inStock, pageable)
                 .map(PlantController::toResp);
  }

  // Supplier
  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/mine")
  public List<Resp> mine(Authentication auth){
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return plants.bySupplier(me.getId()).stream().map(PlantController::toResp).toList();
  }

  @PreAuthorize("hasRole('SUPPLIER')")
  @GetMapping("/mine/page")
  public Page<Resp> minePaged(Authentication auth, Pageable pageable){
    User me = users.findByEmail(auth.getName()).orElseThrow();
    return plants.bySupplierPaged(me.getId(), pageable).map(PlantController::toResp);
  }
}

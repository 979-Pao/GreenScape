package com.tiendaplantas.service;

import com.tiendaplantas.entity.Plant;
import com.tiendaplantas.repository.PlantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import java.util.List;

import java.math.BigDecimal;

import static com.tiendaplantas.service.PlantSpecs.*;

@Service
public class PlantService {
  private final PlantRepository plants;
  public PlantService(PlantRepository plants){ this.plants = plants; }

  public Page<Plant> listAdvanced(String q, String category, BigDecimal min, BigDecimal max, Boolean inStock, Pageable pageable){
    Specification<Plant> spec = Specification.where(text(q))
            .and(category(category))
            .and(priceMin(min))
            .and(priceMax(max))
            .and(inStock(inStock));
    return plants.findAll(spec, pageable);
  }

  public List<Plant> all(){ return plants.findAll(); }

  public List<Plant> search(String q){
    String s = q == null ? "" : q.trim();
    if (s.isEmpty()) return plants.findAll();
    return plants.findByScientificNameContainingIgnoreCaseOrCommonNameContainingIgnoreCaseOrNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(s, s, s, s);}

  public List<Plant> bySupplier(Long supplierId){ return plants.findBySupplier_Id(supplierId); }

  public Plant get(Long id){ return plants.findById(id).orElseThrow(); }
  public Plant save(Plant p){ return plants.save(p); }
  public void delete(Long id){ plants.deleteById(id); }

  // ====== NUEVOS (paginados) ======
  public Page<Plant> listPaged(String q, Pageable pageable){
    String s = q == null ? "" : q.trim();
    if (s.isEmpty()) return plants.findAll(pageable);
    return plants.findByScientificNameContainingIgnoreCaseOrCommonNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(s, s, s, pageable);
  }

  public Page<Plant> bySupplierPaged(Long supplierId, Pageable pageable){
    return plants.findBySupplier_Id(supplierId, pageable);
  }

}

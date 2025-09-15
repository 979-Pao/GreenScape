package com.tiendaplantas.service;

import com.tiendaplantas.entity.Plant;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;

public class PlantSpecs {
    public static Specification<Plant> text(String q){
        if (q == null || q.isBlank()) return null;
        String s = "%" + q.toLowerCase().trim() + "%";
        return (root, cq, cb) -> cb.or(
                cb.like(cb.lower(root.get("scientificName")), s),
                cb.like(cb.lower(root.get("commonName")), s),
                cb.like(cb.lower(root.get("category")), s)
        );
    }

    public static Specification<Plant> category(String cat){
        if (cat == null || cat.isBlank()) return null;
        return (root, cq, cb) -> cb.equal(cb.lower(root.get("category")), cat.toLowerCase().trim());
    }

    public static Specification<Plant> priceMin(BigDecimal min){
        if (min == null) return null;
        return (root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    public static Specification<Plant> priceMax(BigDecimal max){
        if (max == null) return null;
        return (root, cq, cb) -> cb.lessThanOrEqualTo(root.get("price"), max);
    }

    public static Specification<Plant> inStock(Boolean inStock){
        if (inStock == null) return null;
        if (inStock)  return (r,c,cb) -> cb.greaterThan(r.get("stock"), 0);
        else          return (r,c,cb) -> cb.lessThanOrEqualTo(r.get("stock"), 0);
    }
}
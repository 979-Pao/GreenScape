package com.tiendaplantas.repository;

import com.tiendaplantas.entity.Plant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface PlantRepository extends JpaRepository<Plant, Long>, JpaSpecificationExecutor<Plant> {

    // EXISTENTES (no se tocan)
    List<Plant> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
    List<Plant> findBySupplier_Id(Long supplierId);
    List<Plant> findByScientificNameContainingIgnoreCaseOrCommonNameContainingIgnoreCaseOrNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String sci, String common, String name, String category
    );

    // NUEVOS (paginados)
    Page<Plant> findByScientificNameContainingIgnoreCaseOrCommonNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(
            String s1, String s2, String s3, Pageable pageable
    );

    Page<Plant> findBySupplier_Id(Long supplierId, Pageable pageable);
}

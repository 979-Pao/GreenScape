package com.tiendaplantas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTOs para creación/edición y respuesta de Plant.
 * Create: campos obligatorios para POST.
 * Update: todos opcionales para PUT (partial update).
 * Resp:   payload de salida.
 */
public class PlantDtos {

  @Data @NoArgsConstructor
  public static class Create {
    @NotBlank private String scientificName;
    @NotBlank private String commonName;
    private String name;          // alias opcional (tu entidad lo tiene)
    private String description;
    private String category;
    @NotNull  private BigDecimal price;
    @NotNull  private Integer stock;
    private Long supplierId;      // opcional
  }

  @Data @NoArgsConstructor
  public static class Update {
    // todos opcionales → si vienen null, no se tocan
    private String scientificName;
    private String commonName;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private Long supplierId;
  }

  @Data @AllArgsConstructor @NoArgsConstructor
  public static class Resp {
    private Long id;
    private String scientificName;
    private String commonName;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private Long supplierId;
  }
}

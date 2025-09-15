package com.tiendaplantas.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PlantDtos {

  @Data
  @NoArgsConstructor
  public static class PlantRequest {
    private String scientificName;
    private String commonName;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private Long supplierId;
  }

  @Data
  @AllArgsConstructor
  public static class PlantResponse {
    private Long id;
    private String scientificName;
    private String commonName;
    private String description;
    private String category;
    private BigDecimal price;
    private Integer stock;
    private Long supplierId;
  }
}
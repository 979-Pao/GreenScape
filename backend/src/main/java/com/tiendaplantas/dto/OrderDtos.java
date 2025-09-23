package com.tiendaplantas.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTOs para Carrito / Pedidos. Compacto en una sola clase contenedora.
 */
public class OrderDtos {

  // -------- Requests --------
  public static class AddItemDto {
    @NotNull private Long plantId;
    @Min(1) private int quantity;

    public AddItemDto() {}
    public Long getPlantId() { return plantId; }
    public void setPlantId(Long plantId) { this.plantId = plantId; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
  }

  // -------- Responses --------
  public static class OrderItemDto {
    private Long itemId;
    private Long plantId;
    private String scientificName;
    private String commonName;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal lineTotal;

    public OrderItemDto(Long itemId, Long plantId, String scientificName, String commonName,
                        BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {
      this.itemId = itemId; this.plantId = plantId; this.scientificName = scientificName;
      this.commonName = commonName; this.unitPrice = unitPrice; this.quantity = quantity;
      this.lineTotal = lineTotal;
    }

    public Long getItemId() { return itemId; }
    public Long getPlantId() { return plantId; }
    public String getScientificName() { return scientificName; }
    public String getCommonName() { return commonName; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public int getQuantity() { return quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
  }

  public static class OrderDto {
    private Long id;                 // null si es carrito no persistido
    private String status;           // "CART", "PAID", "NEW", etc.
    private List<OrderItemDto> items;
    private BigDecimal total;
    private String createdAt;        // ISO-8601
    private Long customerId;         // id del dueño/creador
    private String customerName;     // nombre del dueño/creador
    private String supplierName;     // NUEVO: nombre del proveedor (para compras)

    // Constructor original (compat)
    public OrderDto(Long id, String status, List<OrderItemDto> items,
                    BigDecimal total, String createdAt, Long customerId) {
      this.id = id; this.status = status; this.items = items; this.total = total;
      this.createdAt = createdAt; this.customerId = customerId;
    }

    // Constructor opcional incluyendo customerName (conveniencia)
    public OrderDto(Long id, String status, List<OrderItemDto> items,
                    BigDecimal total, String createdAt, Long customerId, String customerName) {
      this(id, status, items, total, createdAt, customerId);
      this.customerName = customerName;
    }

    // Constructor opcional incluyendo customerName y supplierName (conveniencia)
    public OrderDto(Long id, String status, List<OrderItemDto> items,
                    BigDecimal total, String createdAt, Long customerId,
                    String customerName, String supplierName) {
      this(id, status, items, total, createdAt, customerId);
      this.customerName = customerName;
      this.supplierName = supplierName;
    }

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public List<OrderItemDto> getItems() { return items; }
    public BigDecimal getTotal() { return total; }
    public String getCreatedAt() { return createdAt; }
    public Long getCustomerId() { return customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    // NUEVO: getter/setter para supplierName
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
  }
}
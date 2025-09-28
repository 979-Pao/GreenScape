package com.tiendaplantas.repository;

import com.tiendaplantas.entity.Order;
import com.tiendaplantas.entity.OrderStatus;
import com.tiendaplantas.entity.OrderType;
import com.tiendaplantas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

  boolean existsBySupplier_Id(Long supplierId);
  boolean existsByCustomer_Id(Long customerId);

  Optional<Order> findByCustomerAndStatus(User customer, OrderStatus status);
  
  List<Order> findByCustomer(User customer);
  List<Order> findDistinctByItems_Plant_Supplier_Id(Long supplierId);

  // historial del cliente 
  List<Order> findByCustomerAndTypeOrderByCreatedAtDesc(User customer, OrderType type);

  // todos los pedidos de clientes (ADMIN)
  List<Order> findByTypeOrderByCreatedAtDesc(OrderType type);

  List<Order> findByTypeAndStatusNotOrderByCreatedAtDesc(OrderType type, OrderStatus status);

  // admin: ver compras
  List<Order> findByType(OrderType type);
  // supplier: bandeja de compras que le hicieron
  List<Order> findBySupplier_IdAndType(Long supplierId, OrderType type);
}
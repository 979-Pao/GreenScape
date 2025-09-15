package com.tiendaplantas.repository;

import com.tiendaplantas.entity.Order;
import com.tiendaplantas.entity.OrderStatus;
import com.tiendaplantas.entity.OrderType;
import com.tiendaplantas.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
  Optional<Order> findByCustomerAndStatus(User customer, OrderStatus status);
  List<Order> findByCustomer(User customer);
  List<Order> findDistinctByItems_Plant_Supplier_Id(Long supplierId);

  // admin: ver compras
  List<Order> findByType(OrderType type);
  // supplier: bandeja de compras que le hicieron
  List<Order> findBySupplier_IdAndType(Long supplierId, OrderType type);
}
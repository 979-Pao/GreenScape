package com.tiendaplantas.controller;

import com.tiendaplantas.entity.Order;
import com.tiendaplantas.entity.OrderStatus;
import com.tiendaplantas.repository.OrderRepository;
import com.tiendaplantas.repository.PlantRepository;
import com.tiendaplantas.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.EnumSet;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportsController {
    private final UserRepository users;
    private final PlantRepository plants;
    private final OrderRepository orders;

    public AdminReportsController(UserRepository users, PlantRepository plants, OrderRepository orders){
        this.users = users; this.plants = plants; this.orders = orders;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/overview")
    public Map<String,Object> overview(){
        long totalUsers = users.count();
        long totalPlants = plants.count();
        long totalOrders = orders.count();

        EnumSet<OrderStatus> statuses = EnumSet.of(OrderStatus.PAID, OrderStatus.SHIPPED);
        BigDecimal revenue = orders.findAll().stream()
                .filter(o -> statuses.contains(o.getStatus()))
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "totalUsers", totalUsers,
                "totalPlants", totalPlants,
                "totalOrders", totalOrders,
                "totalRevenue", revenue
        );
    }
}
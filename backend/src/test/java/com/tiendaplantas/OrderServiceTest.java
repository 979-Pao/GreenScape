package com.tiendaplantas;

import com.tiendaplantas.service.OrderService;
import com.tiendaplantas.service.PlantService;
import com.tiendaplantas.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class OrderServiceTest {

    @Autowired OrderService orders;
    @Autowired UserRepository users;
    @Autowired PlantService plants;

    @Test
    void checkout_happy_path() {
        var email = "client@tienda.com";
        var all = plants.all();
        var plantId = all.get(0).getId();

        orders.addToCart(email, plantId, 1);
        var dto = orders.checkout(email);

        // assert estado pagado
        org.assertj.core.api.Assertions.assertThat(dto.getStatus()).isEqualTo("PAID");
    }
}
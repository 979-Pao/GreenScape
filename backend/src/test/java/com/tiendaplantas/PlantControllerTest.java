package com.tiendaplantas;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PlantControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void list_paged_ok() throws Exception {
        mvc.perform(get("/api/plants/page").param("page","0").param("size","5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }
}
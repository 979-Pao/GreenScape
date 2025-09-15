package com.tiendaplantas.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {
    private final JdbcTemplate jdbc;
    public HealthController(JdbcTemplate jdbc){ this.jdbc = jdbc; }

    @GetMapping
    public Map<String, Object> health(){
        boolean dbUp;
        try {
            Integer one = jdbc.queryForObject("SELECT 1", Integer.class);
            dbUp = (one != null && one == 1);
        } catch (Exception e){
            dbUp = false;
        }
        return Map.of(
                "status", dbUp ? "UP" : "DOWN",
                "db", dbUp,
                "time", Instant.now().toString()
        );
    }
}
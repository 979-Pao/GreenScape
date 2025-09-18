package com.tiendaplantas.config;

import com.tiendaplantas.entity.*;
import com.tiendaplantas.repository.BlogPostRepository;
import com.tiendaplantas.repository.PlantRepository;
import com.tiendaplantas.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seed(
            UserRepository users,
            PlantRepository plants,
            BlogPostRepository blogs,
            PasswordEncoder encoder
    ) {
        return args -> {
            // --- Usuarios ---
            User admin = upsertUser(users,
                    "admin@tienda.com", "Admin", Role.ADMIN, "admin123", encoder);
            User client = upsertUser(users,
                    "client@tienda.com", "Cliente Demo", Role.CLIENT, "client123", encoder);
            User supplier = upsertUser(users,
                    "supplier@tienda.com", "Proveedor Demo", Role.SUPPLIER, "supplier123", encoder);

            // --- Plantas ---
            if (plants.count() == 0) {
                List<Plant> seed = new ArrayList<>();
                seed.add(p("Monstera deliciosa", "Monstera", "Hojas grandes, fácil de cuidar", "interior", 19.99, 25, supplier));
                seed.add(p("Ficus lyrata", "Higuera de hoja de violín", "Luz indirecta brillante", "interior", 29.90, 12, supplier));
                seed.add(p("Dracaena trifasciata", "Lengua de suegra (Sansevieria)", "Muy resistente", "interior", 12.50, 40, supplier));
                seed.add(p("Epipremnum aureum", "Pothos aureus", "Perfecta para principiantes", "interior", 9.95, 50, supplier));
                seed.add(p("Echinopsis spp.", "Cactus Echinopsis", "Cactus de flor; poco riego", "exterior", 7.80, 30, supplier));
                seed.add(p("Aloe vera", "Aloe vera", "Suculenta medicinal; mucha luz", "interior", 8.90, 35, supplier));
                seed.add(p("Calathea orbifolia", "Calatea orbifolia", "Hojas rayadas; humedad media", "interior", 22.00, 15, supplier));
                seed.add(p("Tradescantia zebrina", "Amor de hombre", "Hojas plateadas/lilas", "interior", 6.50, 45, supplier));
                seed.add(p("Philodendron hederaceum", "Filodendro corazón", "Trepadora de interior", "interior", 14.75, 28, supplier));
                seed.add(p("Dracaena marginata", "Drácena marginata", "Hojas finas; purifica el aire", "interior", 16.40, 20, supplier));
                seed.add(p("Nephrolepis exaltata", "Helecho Boston", "Humedad alta; sombra", "interior", 11.20, 22, supplier));
                seed.add(p("Ceropegia woodii", "Rosario", "Colgante; poco riego", "interior", 13.30, 18, supplier));
                seed.add(p("Peperomia obtusifolia", "Peperomia", "Compacta; riego moderado", "interior", 10.60, 26, supplier));
                seed.add(p("Hoya carnosa", "Hoya", "Cera; florece en interior", "interior", 18.90, 14, supplier));
                seed.add(p("Zamioculcas zamiifolia", "Zamioculca (ZZ)", "Tolerante a poca luz", "interior", 21.50, 19, supplier));
                plants.saveAll(seed);
            }

            // --- Blog ---
            if (blogs.count() == 0) {
                List<BlogPost> posts = new ArrayList<>();
                posts.add(post("Guía básica de riego", "guia-basica-riego",
                        "Aprende a regar tus plantas sin ahogarlas. Frecuencia, sustrato y señales.",
                        PostStatus.PUBLISHED, admin));
                posts.add(post("Luz para interiores", "luz-para-interiores",
                        "Identifica si tu planta necesita sol directo o luz indirecta brillante.",
                        PostStatus.PUBLISHED, admin));
                posts.add(post("Top 5 plantas fáciles", "top-5-plantas-faciles",
                        "Sansevieria, Pothos, ZZ, Monstera y Drácena: por qué son ideales para empezar.",
                        PostStatus.PUBLISHED, admin));
                posts.add(post("Errores comunes de principiantes", "errores-comunes",
                        "Demasiado riego, poca luz, macetas sin drenaje y fertilización excesiva.",
                        PostStatus.DRAFT, admin));
                posts.add(post("Cómo trasplantar sin estrés", "como-trasplantar",
                        "Paso a paso para cambiar de maceta y no dañar raíces. Herramientas y tiempos.",
                        PostStatus.PUBLISHED, admin));
                blogs.saveAll(posts);
            }

            log.info("✅ Seed insertado");
        };
    }

    /** Crea o actualiza el usuario; si existe con password sin codificar, la codifica. */
    private static User upsertUser(
            UserRepository repo,
            String email,
            String name,
            Role role,
            String rawPassword,
            PasswordEncoder encoder
    ) {
        return repo.findByEmail(email)
                .map(u -> {
                    // Si parece no-BCrypt, re-codificar
                    String p = u.getPassword();
                    if (!isBcrypt(p)) {
                        u.setPassword(encoder.encode(rawPassword));
                        u.setRole(role);
                        u.setName(name);
                        return repo.save(u);
                    }
                    // ya correcto
                    return u;
                })
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail(email);
                    u.setName(name);
                    u.setRole(role);
                    u.setPassword(encoder.encode(rawPassword));
                    return repo.save(u);
                });
    }

    /** Heurística sencilla para detectar BCrypt. */
    private static boolean isBcrypt(String p) {
        if (p == null) return false;
        return p.startsWith("$2a$") || p.startsWith("$2b$") || p.startsWith("$2y$")
                || p.startsWith("{bcrypt}$2a$") || p.startsWith("{bcrypt}$2b$") || p.startsWith("{bcrypt}$2y$");
    }

    private static Plant p(String sci, String common, String desc, String category,
                           double price, int stock, User supplier) {
        Plant plant = new Plant();
        plant.setScientificName(sci);
        plant.setCommonName(common);
        plant.setName(sci); // si tienes ambos campos 'name' y 'scientificName'
        plant.setDescription(desc);
        plant.setCategory(category);
        plant.setPrice(BigDecimal.valueOf(price));
        plant.setStock(stock);
        plant.setSupplier(supplier);
        return plant;
    }

    private static BlogPost post(String title, String slug, String content,
                                 PostStatus status, User author) {
        BlogPost b = new BlogPost();
        b.setTitle(title);
        b.setSlug(slug);
        b.setContent(content);
        b.setStatus(status);
        b.setCreatedAt(Instant.now());
        // Quita esta línea si tu entidad BlogPost no tiene 'author'
        b.setAuthor(author);
        return b;
    }
}

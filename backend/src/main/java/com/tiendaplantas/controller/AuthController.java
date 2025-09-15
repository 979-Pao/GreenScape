package com.tiendaplantas.controller;

import com.tiendaplantas.dto.AuthDtos.*;
import com.tiendaplantas.entity.Role;
import com.tiendaplantas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService auth;

  public AuthController(AuthService auth) {
    this.auth = auth;
  }

  // Público: registro SIEMPRE como CLIENT
  @PostMapping("/register")
  public ResponseEntity<AuthResponse> registerClient(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.ok(auth.registerClient(req));
  }

  // Público: login
  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
    return ResponseEntity.ok(auth.login(req.getEmail(), req.getPassword()));
  }

  // Solo ADMIN: crear usuarios de cualquier rol (ADMIN/CLIENT/SUPPLIER)
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/admin/create-user")
  public ResponseEntity<UserResponse> createUserAsAdmin(
          @Valid @RequestBody RegisterRequest req,
          @RequestParam("role") Role role
  ) {
    return ResponseEntity.ok(auth.createUserAsAdmin(req, role));
  }
}
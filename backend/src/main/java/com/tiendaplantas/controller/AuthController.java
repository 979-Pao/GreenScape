package com.tiendaplantas.controller;

import com.tiendaplantas.dto.AuthDtos.AuthResponse;
import com.tiendaplantas.dto.AuthDtos.LoginRequest;
import com.tiendaplantas.dto.AuthDtos.RegisterRequest;
import com.tiendaplantas.dto.AuthDtos.UserResponse;
import com.tiendaplantas.entity.Role;
import com.tiendaplantas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService auth;

  public AuthController(AuthService auth) {
    this.auth = auth;
  }

  /** Registro público: siempre como CLIENT */
  @PostMapping("/register")
  public ResponseEntity<AuthResponse> registerClient(@Valid @RequestBody RegisterRequest req) {
    return ResponseEntity.ok(auth.registerClient(req));
  }

  /** Login: devuelve { token, user } y 401 si las credenciales no son válidas */
  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    try {
      AuthResponse resp = auth.login(req.getEmail(), req.getPassword());
      return ResponseEntity.ok(resp);
    } catch (BadCredentialsException ex) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("message", "Credenciales inválidas"));
    }
  }

  /** Usuario actual (para el front /me) */
  @GetMapping("/me")
  public ResponseEntity<UserResponse> me(Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    // El servicio puede buscar por email/username desde principal.getName()
    UserResponse user = auth.me(principal.getName());
    return ResponseEntity.ok(user);
  }

  /** Solo ADMIN: crear usuarios con rol específico */
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping("/admin/create-user")
  public ResponseEntity<UserResponse> createUserAsAdmin(
      @Valid @RequestBody RegisterRequest req,
      @RequestParam("role") Role role
  ) {
    return ResponseEntity.ok(auth.createUserAsAdmin(req, role));
  }
}

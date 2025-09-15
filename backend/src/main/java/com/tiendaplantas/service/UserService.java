package com.tiendaplantas.service;

import com.tiendaplantas.dto.AuthDtos.RegisterRequest;
import com.tiendaplantas.dto.AuthDtos.UserResponse;
import com.tiendaplantas.entity.Role;
import com.tiendaplantas.entity.User;
import com.tiendaplantas.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  public UserService(UserRepository users, PasswordEncoder encoder) { this.users = users; this.encoder = encoder; }

  @Transactional
  public UserResponse register(RegisterRequest req, Role role) {
    User u = new User();
    u.setName(req.getName());
    u.setEmail(req.getEmail());
    u.setPassword(encoder.encode(req.getPassword()));
    u.setRole(role);
    u.setPhone(req.getPhone());
    users.save(u);
    return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
  }

  public User findByEmail(String email) { return users.findByEmail(email).orElse(null); }
}
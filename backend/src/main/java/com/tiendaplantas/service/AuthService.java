package com.tiendaplantas.service;

import com.tiendaplantas.config.JwtService;
import com.tiendaplantas.dto.AuthDtos.*;
import com.tiendaplantas.entity.Role;
import com.tiendaplantas.entity.User;
import com.tiendaplantas.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt, AuthenticationManager authManager) {
        this.users = users; this.encoder = encoder; this.jwt = jwt; this.authManager = authManager;
    }

    public AuthResponse registerClient(RegisterRequest req){
        if (users.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email ya registrado");
        }
        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setPhone(req.getPhone());
        u.setRole(Role.CLIENT);
        users.save(u);

        String token = jwt.generateToken(u.getEmail(), u.getRole().name());
        return new AuthResponse(token, u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }

    public AuthResponse login(String email, String password){
        authManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        User u = users.findByEmail(email).orElseThrow();
        String token = jwt.generateToken(u.getEmail(), u.getRole().name());
        return new AuthResponse(token, u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }

    public UserResponse createUserAsAdmin(RegisterRequest req, Role role){
        if (users.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email ya registrado");
        }
        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setPhone(req.getPhone());
        u.setRole(role);
        users.save(u);
        return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
}
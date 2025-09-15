package com.tiendaplantas.config;

import com.tiendaplantas.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserRepository users;

    public JwtAuthFilter(JwtService jwt, UserRepository users) {
        this.jwt = jwt; this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String auth = request.getHeader("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = auth.substring(7);
        try {
            String email = jwt.extractUsername(token);
            String role = jwt.extractRole(token); // "ADMIN", "CLIENT", "SUPPLIER"
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // (opcional) validar usuario existe
                users.findByEmail(email).orElseThrow();

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null,
                                role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role)) : List.of());
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            // token inválido/expirado: dejamos pasar sin autenticación; las rutas protegidas fallarán con 401
        }
        chain.doFilter(request, response);
    }
}
package com.tiendaplantas.controller;

import com.tiendaplantas.dto.UserDtos.UserSummary;
import com.tiendaplantas.entity.User;
import com.tiendaplantas.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;
    public UserController(UserRepository users){ this.users = users; }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<UserSummary> all(){
        return users.findAll().stream()
                .map(u -> new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getRole().name()))
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public UserSummary one(@PathVariable Long id){
        User u = users.findById(id).orElseThrow();
        return new UserSummary(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
    }
}
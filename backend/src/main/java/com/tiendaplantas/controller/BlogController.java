package com.tiendaplantas.controller;

import com.tiendaplantas.dto.BlogDtos.*;
import com.tiendaplantas.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blog")
public class BlogController {

  private final BlogService blog;

  public BlogController(BlogService blog) {
    this.blog = blog;
  }

  // Públicos
  @GetMapping
  public List<PostResponse> list() { return blog.list(); }

  @GetMapping("/{id}")
  public PostResponse get(@PathVariable Long id) { return blog.get(id); }

  // Solo ADMIN
  @PreAuthorize("hasRole('ADMIN')")
  @PostMapping
  public PostResponse create(@Valid @RequestBody PostRequest req) { return blog.create(req); }

  @PreAuthorize("hasRole('ADMIN')")
  @PutMapping("/{id}")
  public PostResponse update(@PathVariable Long id, @RequestBody PostRequest req) { return blog.update(id, req); }

  @PreAuthorize("hasRole('ADMIN')")
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    blog.delete(id);
    return ResponseEntity.noContent().build();
  }
}
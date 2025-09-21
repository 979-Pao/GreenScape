package com.tiendaplantas.controller;

import com.tiendaplantas.dto.BlogDtos;
import com.tiendaplantas.entity.BlogPost;
import com.tiendaplantas.entity.PostStatus;
import com.tiendaplantas.repository.BlogPostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blog")
public class BlogController {

  private final BlogPostRepository posts;

  public BlogController(BlogPostRepository posts) { this.posts = posts; }

  private static BlogDtos.Resp toResp(BlogPost p){
    String created = (p.getCreatedAt() != null) ? p.getCreatedAt().toString() : null;
    Long authorId  = (p.getAuthor() != null) ? p.getAuthor().getId() : null;
    return new BlogDtos.Resp(
      p.getId(), p.getTitle(), p.getSlug(), p.getContent(),
      p.getStatus(),            // 👈 enum directo, no .name()
      created, authorId
    );
  }

  // Listado público paginado: solo PUBLISHED
  @GetMapping
  public Page<BlogDtos.Resp> list(Pageable pageable){
    return posts.findByStatusOrderByCreatedAtDesc(PostStatus.PUBLISHED, pageable)
                .map(BlogController::toResp);
  }

  @GetMapping("/{id}")
  public BlogDtos.Resp get(@PathVariable Long id){
    return toResp(posts.findById(id).orElseThrow());
  }

  @GetMapping("/slug/{slug}")
  public BlogDtos.Resp bySlug(@PathVariable String slug){
    return toResp(posts.findBySlug(slug).orElseThrow());
  }
}

package com.tiendaplantas.service;

import com.tiendaplantas.dto.BlogDtos;
import com.tiendaplantas.entity.BlogPost;
import com.tiendaplantas.entity.PostStatus;
import com.tiendaplantas.repository.BlogPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class BlogService {

  private final BlogPostRepository posts;

  public BlogService(BlogPostRepository posts) {
    this.posts = posts;
  }

  // -------- Públicos --------
  public List<BlogDtos.Resp> list() {
    return posts.findAll().stream().map(this::toResp).toList();
  }

  public BlogDtos.Resp get(Long id) {
    return toResp(posts.findById(id).orElseThrow());
  }

  // -------- Solo ADMIN --------
  public BlogDtos.Resp create(BlogDtos.Create req) {
    BlogPost p = new BlogPost();
    p.setTitle(req.getTitle());
    p.setSlug(req.getSlug());
    p.setContent(req.getContent());
    // DTO trae enum -> set directo
    if (req.getStatus() != null) p.setStatus(req.getStatus());
    if (p.getCreatedAt() == null) p.setCreatedAt(Instant.now());
    posts.save(p);
    return toResp(p);
  }

  public BlogDtos.Resp update(Long id, BlogDtos.Create req) {
    BlogPost p = posts.findById(id).orElseThrow();
    if (req.getTitle()   != null) p.setTitle(req.getTitle());
    if (req.getSlug()    != null) p.setSlug(req.getSlug());
    if (req.getContent() != null) p.setContent(req.getContent());
    if (req.getStatus()  != null) p.setStatus(req.getStatus()); // enum directo
    posts.save(p);
    return toResp(p);
  }

  public void delete(Long id) {
    posts.deleteById(id);
  }

  // -------- Helpers --------
  private BlogDtos.Resp toResp(BlogPost p) {
    String created = (p.getCreatedAt() != null) ? p.getCreatedAt().toString() : null;
    Long authorId  = (p.getAuthor() != null) ? p.getAuthor().getId() : null;
    PostStatus status = p.getStatus(); // enum
    return new BlogDtos.Resp(
        p.getId(), p.getTitle(), p.getSlug(), p.getContent(),
        status, created, authorId
    );
  }
}

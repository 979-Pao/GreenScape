package com.tiendaplantas.service;

import com.tiendaplantas.dto.BlogDtos.PostRequest;
import com.tiendaplantas.dto.BlogDtos.PostResponse;
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
  public List<PostResponse> list() {
    return posts.findAll().stream().map(this::toResp).toList();
  }

  public PostResponse get(Long id) {
    return toResp(posts.findById(id).orElseThrow());
  }

  // -------- Solo ADMIN --------
  public PostResponse create(PostRequest req) {
    BlogPost p = new BlogPost();
    p.setTitle(req.getTitle());
    p.setSlug(req.getSlug());
    p.setContent(req.getContent());
    // status como ENUM
    p.setStatus(parseStatus(req.getStatus()));
    // createdAt como Instant
    if (p.getCreatedAt() == null) p.setCreatedAt(Instant.now());
    posts.save(p);
    return toResp(p);
  }

  public PostResponse update(Long id, PostRequest req) {
    BlogPost p = posts.findById(id).orElseThrow();
    if (req.getTitle()   != null) p.setTitle(req.getTitle());
    if (req.getSlug()    != null) p.setSlug(req.getSlug());
    if (req.getContent() != null) p.setContent(req.getContent());
    if (req.getStatus()  != null) p.setStatus(parseStatus(req.getStatus()));
    posts.save(p);
    return toResp(p);
  }

  public void delete(Long id) {
    posts.deleteById(id);
  }

  // -------- Helpers --------
  private PostStatus parseStatus(String s) {
    // tolerante a minúsculas
    return PostStatus.valueOf(s.trim().toUpperCase());
  }

  private PostResponse toResp(BlogPost p) {
    String created = p.getCreatedAt() != null ? p.getCreatedAt().toString() : null; // Instant -> ISO-8601
    Long authorId  = p.getAuthor() != null ? p.getAuthor().getId() : null;
    String status  = p.getStatus() != null ? p.getStatus().name() : null;           // enum -> String
    return new PostResponse(p.getId(), p.getTitle(), p.getSlug(), p.getContent(), status, created, authorId);
  }
}

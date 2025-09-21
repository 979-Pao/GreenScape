package com.tiendaplantas.repository;

import com.tiendaplantas.entity.BlogPost;
import com.tiendaplantas.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
  Optional<BlogPost> findBySlug(String slug);
  boolean existsBySlug(String slug);
  boolean existsBySlugAndIdNot(String slug, Long id);
  Page<BlogPost> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);
}

package com.tiendaplantas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity @Getter @Setter @NoArgsConstructor
public class BlogPost extends BaseEntity {
  @NotBlank private String title;
  @Column(unique = true) private String slug;
  @Lob private String content;
  @Enumerated(EnumType.STRING) private PostStatus status = PostStatus.DRAFT;
  private Instant publishedAt;

  @ManyToOne(fetch = FetchType.LAZY) private User author;
}

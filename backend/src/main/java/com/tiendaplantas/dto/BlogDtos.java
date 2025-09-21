package com.tiendaplantas.dto;

import com.tiendaplantas.entity.PostStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** DTOs de Blog: Create/Update/Resp */
public class BlogDtos {

  @Data @NoArgsConstructor
  public static class Create {
    @NotBlank private String title;
    private String slug;          // opcional: si no viene, lo generamos
    @NotBlank private String content;
    private PostStatus status;    // DRAFT/PUBLISHED; si no viene → DRAFT
  }

  @Data @NoArgsConstructor
  public static class Update {
    private String title;
    private String slug;
    private String content;
    private PostStatus status;
  }

  @Data @AllArgsConstructor @NoArgsConstructor
  public static class Resp {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private PostStatus status;
    private String createdAt; // ISO-8601
    private Long authorId;
  }
}

package com.tiendaplantas.dto;

import com.tiendaplantas.entity.PostStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class BlogDtos {

  @Data @NoArgsConstructor
  public static class Create {
    @NotBlank private String title;
    private String slug;          
    @NotBlank private String content;
    private PostStatus status;    
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
    private String createdAt; 
    private Long authorId;
  }
}

package com.tiendaplantas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTOs para Blog. Mantiene el backend compacto en una sola clase contenedora.
 */
public class BlogDtos {

  // -------- Requests --------
  public static class PostRequest {
    @NotBlank @Size(max = 150)
    private String title;

    // Puedes validar el slug si quieres (ej: solo letras, números y guiones).
    @NotBlank @Size(max = 160)
    private String slug;

    @NotBlank
    private String content;

    // "DRAFT" o "PUBLISHED" (o lo que uses en tu entidad)
    @NotBlank
    private String status;

    public PostRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
  }

  // -------- Responses --------
  public static class PostResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String status;
    private String createdAt; // ISO-8601 string (opcional)
    private Long authorId;    // si manejas autor

    public PostResponse(Long id, String title, String slug, String content, String status, String createdAt, Long authorId) {
      this.id = id; this.title = title; this.slug = slug; this.content = content;
      this.status = status; this.createdAt = createdAt; this.authorId = authorId;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getSlug() { return slug; }
    public String getContent() { return content; }
    public String getStatus() { return status; }
    public String getCreatedAt() { return createdAt; }
    public Long getAuthorId() { return authorId; }
  }
}
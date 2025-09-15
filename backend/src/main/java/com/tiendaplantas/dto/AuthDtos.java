package com.tiendaplantas.dto;

public class AuthDtos {

  // ---------- Requests ----------
  public static class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;

    public RegisterRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
  }

  public static class LoginRequest {
    private String email;
    private String password;

    public LoginRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
  }

  // ---------- Responses ----------
  public static class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;

    public AuthResponse(String token, Long userId, String name, String email, String role) {
      this.token = token; this.userId = userId; this.name = name; this.email = email; this.role = role;
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
  }

  public static class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;

    public UserResponse(Long id, String name, String email, String role) {
      this.id = id; this.name = name; this.email = email; this.role = role;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
  }
}

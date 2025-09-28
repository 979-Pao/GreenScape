package com.tiendaplantas.dto;

import com.tiendaplantas.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/*** Create: alta (POST) */
public class UserDtos {

  @Data @NoArgsConstructor
  public static class Create {
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @NotBlank private String password;
    @NotNull private Role role;
    private String phone;
  }

  @Data @NoArgsConstructor
  public static class Update {
    private String name;
    private String phone;
    private String password;
    private Role role;
  }

  @Data @AllArgsConstructor @NoArgsConstructor
  public static class Resp {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
  }

  @Data @AllArgsConstructor @NoArgsConstructor
  public static class Summary {
    private Long id;
    private String name;
    private String email;
    private String role; 
  }
}

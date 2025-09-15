package com.tiendaplantas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity @Getter @Setter @NoArgsConstructor
@Table(name = "users", indexes = {@Index(columnList = "email", unique = true)})
public class User extends BaseEntity {
  @NotBlank private String name;
  @Email @NotBlank private String email;
  @NotBlank private String password;
  @Enumerated(EnumType.STRING) private Role role = Role.CLIENT;
  private String phone;
}

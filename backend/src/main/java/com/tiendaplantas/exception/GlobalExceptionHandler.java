package com.tiendaplantas.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  // Respuesta de error compacta
  record Err(String error, String message) {}

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
  public Err invalid(MethodArgumentNotValidException e){
    String msg = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .findFirst().orElse("Validation failed");
    return new Err("VALIDATION_ERROR", msg);
  }

  @ExceptionHandler(ConstraintViolationException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Err badReq(ConstraintViolationException e){
    String msg = e.getConstraintViolations().stream()
            .map(v -> v.getPropertyPath() + ": " + v.getMessage())
            .findFirst().orElse("Bad request");
    return new Err("BAD_REQUEST", msg);
  }

  @ExceptionHandler(java.util.NoSuchElementException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Err notFound(Exception e){ return new Err("NOT_FOUND", e.getMessage()); }

  @ExceptionHandler(DataIntegrityViolationException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  public Err integrity(DataIntegrityViolationException e){
    return new Err("CONFLICT", "Violación de integridad de datos");
  }

  // ⛔️ CONCURRENCIA (tipo exacto de Spring Data)
  @ExceptionHandler(org.springframework.dao.OptimisticLockingFailureException.class)
  @ResponseStatus(org.springframework.http.HttpStatus.CONFLICT)
  public Err optimisticSpring(org.springframework.dao.OptimisticLockingFailureException e) {
    return new Err("CONFLICT", "Stock modificado por otra operación. Intenta de nuevo.");
  }

  // ⛔️ CONCURRENCIA (tipo de ORM/JPA)
  @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
  @ResponseStatus(org.springframework.http.HttpStatus.CONFLICT)
  public Err optimisticJpa(org.springframework.orm.ObjectOptimisticLockingFailureException e) {
    return new Err("CONFLICT", "El recurso fue actualizado por otro proceso. Intenta nuevamente.");
  }

  @ExceptionHandler(AccessDeniedException.class)
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public Err forbidden(AccessDeniedException e){
    return new Err("FORBIDDEN", "No tienes permisos para esta operación");
  }

  @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
  public org.springframework.http.ResponseEntity<Err> status(org.springframework.web.server.ResponseStatusException e) {
    var code = e.getStatusCode();
    var reason = (e.getReason() != null ? e.getReason() : "Error");
    return org.springframework.http.ResponseEntity
            .status(code)
            .body(new Err(code.toString(), reason));
  }

  // Fallback (lo inesperado = 500)
  @ExceptionHandler(RuntimeException.class)
  @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  public Err runtime(RuntimeException e){
    return new Err("INTERNAL_ERROR", "Ocurrió un error inesperado");
  }

  @ExceptionHandler(IllegalStateException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public Err illegal(IllegalStateException e){
    return new Err("BAD_REQUEST", e.getMessage());
  }
}
package com.campusplacement.portal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String,String>> handle(ResponseStatusException e) {
        String reason=e.getReason()==null?"Request failed":e.getReason();
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error",reason));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> generic(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error","Server error. Check database connection and application logs."));
    }
}

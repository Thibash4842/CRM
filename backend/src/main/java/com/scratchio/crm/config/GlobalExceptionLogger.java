package com.scratchio.crm.config;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.ResponseEntity;

import java.io.FileWriter;
import java.io.PrintWriter;

@ControllerAdvice
public class GlobalExceptionLogger {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAllExceptions(Exception ex) {
        try (FileWriter fw = new FileWriter("backend_error.log", true);
             PrintWriter pw = new PrintWriter(fw)) {
            pw.println("Exception: " + ex.getMessage());
            ex.printStackTrace(pw);
            pw.println("-------------------------------------------------");
        } catch (Exception e) {}
        
        throw new RuntimeException(ex);
    }
}

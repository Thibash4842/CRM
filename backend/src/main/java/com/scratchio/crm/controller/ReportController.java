package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Map<String, Object>>> revenue() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.revenueReport()));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sales() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.salesReport()));
    }

    @GetMapping("/leads")
    public ResponseEntity<ApiResponse<Map<String, Object>>> leads() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.leadReport()));
    }

    @GetMapping("/conversion")
    public ResponseEntity<ApiResponse<Map<String, Object>>> conversion() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.conversionReport()));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Map<String, Object>>> projects() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.projectReport()));
    }
}

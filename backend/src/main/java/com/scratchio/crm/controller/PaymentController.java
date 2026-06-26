package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.PaymentResponse;
import com.scratchio.crm.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAll()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getSummary()));
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getByInvoice(invoiceId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.recordPayment(data)));
    }
}

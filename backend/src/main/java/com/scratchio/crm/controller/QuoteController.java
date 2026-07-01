package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.QuoteResponse;
import com.scratchio.crm.entity.enums.QuoteStatus;
import com.scratchio.crm.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuoteResponse>>> getAllQuotes(
            @RequestParam(required = false) QuoteStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Quotes retrieved successfully", quoteService.getAll(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuoteResponse>> getQuote(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Quote retrieved successfully", quoteService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES_EXECUTIVE')")
    public ResponseEntity<ApiResponse<QuoteResponse>> createQuote(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Quote created successfully", quoteService.create(data)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES_EXECUTIVE')")
    public ResponseEntity<ApiResponse<QuoteResponse>> updateQuoteStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        QuoteStatus status = QuoteStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("Quote status updated", quoteService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteQuote(@PathVariable Long id) {
        quoteService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Quote deleted successfully", null));
    }
}

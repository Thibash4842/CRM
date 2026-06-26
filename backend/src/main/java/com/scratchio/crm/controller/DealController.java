package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.DealResponse;
import com.scratchio.crm.entity.enums.DealStage;
import com.scratchio.crm.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DealResponse>>> getAll(
            @RequestParam(required = false) DealStage stage) {
        if (stage != null) {
            return ResponseEntity.ok(ApiResponse.ok(dealService.getByStage(stage)));
        }
        return ResponseEntity.ok(ApiResponse.ok(dealService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DealResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DealResponse>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.create(data)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DealResponse>> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(dealService.update(id, data)));
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<ApiResponse<DealResponse>> updateStage(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                dealService.updateStage(id, DealStage.valueOf(body.get("stage")))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        dealService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Deal deleted", null));
    }
}

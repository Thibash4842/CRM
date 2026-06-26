package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.LeadResponse;
import com.scratchio.crm.entity.enums.LeadStatus;
import com.scratchio.crm.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeadResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(required = false) String source) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.getAll(search, status, source)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LeadResponse>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.create(data)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadResponse>> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.update(id, data)));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        leadService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Lead permanently deleted", null));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<ApiResponse<LeadResponse>> convert(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.convert(id, data)));
    }

    @PostMapping("/{id}/lost")
    public ResponseEntity<ApiResponse<LeadResponse>> markLost(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.markLost(id, data)));
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<LeadResponse>> restore(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(leadService.restore(id)));
    }

    @GetMapping("/trash")
    public ResponseEntity<ApiResponse<List<LeadResponse>>> getTrash() {
        return ResponseEntity.ok(ApiResponse.ok(leadService.getTrash()));
    }

    @GetMapping("/converted")
    public ResponseEntity<ApiResponse<List<LeadResponse>>> getConverted() {
        return ResponseEntity.ok(ApiResponse.ok(leadService.getAll(null, LeadStatus.WON, null)));
    }

    @GetMapping("/lost")
    public ResponseEntity<ApiResponse<List<LeadResponse>>> getLost() {
        return ResponseEntity.ok(ApiResponse.ok(leadService.getAll(null, LeadStatus.LOST, null)));
    }
}

package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.ActivityResponse;
import com.scratchio.crm.dto.response.EntityMappers.ClientResponse;
import com.scratchio.crm.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClientResponse>>> getAll(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getAll(search)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClientResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getById(id)));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.getTimeline(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClientResponse>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.create(data)));
    }

    @PostMapping("/convert/{leadId}")
    public ResponseEntity<ApiResponse<ClientResponse>> convertFromLead(@PathVariable Long leadId) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.convertFromLead(leadId)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClientResponse>> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(clientService.update(id, data)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Client deleted", null));
    }
}

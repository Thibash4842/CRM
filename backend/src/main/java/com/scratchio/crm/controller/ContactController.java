package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.ContactResponse;
import com.scratchio.crm.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<ApiResponse<List<ContactResponse>>> getByLeadId(@PathVariable Long leadId) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.getByLeadId(leadId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(contactService.create(data)));
    }
}

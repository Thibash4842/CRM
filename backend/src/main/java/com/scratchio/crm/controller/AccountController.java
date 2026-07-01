package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.AccountResponse;
import com.scratchio.crm.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getByLeadId(@PathVariable Long leadId) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getByLeadId(leadId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.create(data)));
    }
}

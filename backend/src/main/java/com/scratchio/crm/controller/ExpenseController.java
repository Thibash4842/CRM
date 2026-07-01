package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.ExpenseResponse;
import com.scratchio.crm.entity.enums.ExpenseStatus;
import com.scratchio.crm.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAllExpenses(
            @RequestParam(required = false) ExpenseStatus status) {
        return ResponseEntity.ok(ApiResponse.ok("Expenses retrieved successfully", expenseService.getAll(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpense(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Expense retrieved successfully", expenseService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES_EXECUTIVE')")
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(@RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Expense created successfully", expenseService.create(data)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')") // Restrict status update
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpenseStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        ExpenseStatus status = ExpenseStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("Expense status updated", expenseService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted successfully", null));
    }
}

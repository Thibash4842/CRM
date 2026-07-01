package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.ExpenseResponse;
import com.scratchio.crm.entity.Expense;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.ExpenseStatus;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.ExpenseRepository;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ActivityService activityService;
    private final AuditLogService auditLogService;
    private final CustomUserDetailsService userDetailsService;

    public List<ExpenseResponse> getAll(ExpenseStatus status) {
        List<Expense> expenses = expenseRepository.findAll();
        if (status != null) {
            expenses = expenses.stream().filter(e -> e.getStatus() == status).collect(Collectors.toList());
        }
        return expenses.stream().map(ExpenseResponse::from).collect(Collectors.toList());
    }

    public ExpenseResponse getById(Long id) {
        return ExpenseResponse.from(findExpense(id));
    }

    @Transactional
    public ExpenseResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        
        Expense expense = Expense.builder()
                .expenseNumber(generateExpenseNumber())
                .employee(currentUser)
                .category((String) data.get("category"))
                .vendor((String) data.get("vendor"))
                .amount(new BigDecimal(data.get("amount").toString()))
                .date(LocalDate.parse((String) data.get("date")))
                .status(ExpenseStatus.valueOf(data.getOrDefault("status", "DRAFT").toString()))
                .notes((String) data.get("notes"))
                .createdBy(currentUser)
                .build();

        expense = expenseRepository.save(expense);
        activityService.log("EXPENSE", expense.getId(), ActivityType.CREATED, "Expense created", expense.getExpenseNumber());
        auditLogService.log("Submitted Expense", "Expenses", "Expense " + expense.getExpenseNumber() + " submitted for " + expense.getAmount(), currentUser);
        return ExpenseResponse.from(expense);
    }

    @Transactional
    public ExpenseResponse updateStatus(Long id, ExpenseStatus status) {
        Expense expense = findExpense(id);
        expense.setStatus(status);
        expense = expenseRepository.save(expense);
        
        User currentUser = userDetailsService.getCurrentUserEntity();
        auditLogService.log("Updated Expense", "Expenses", "Expense ID " + id + " status changed to " + status, currentUser);
        return ExpenseResponse.from(expense);
    }

    @Transactional
    public void delete(Long id) {
        Expense expense = findExpense(id);
        User currentUser = userDetailsService.getCurrentUserEntity();
        auditLogService.log("Deleted Expense", "Expenses", "Expense " + expense.getExpenseNumber() + " deleted", currentUser);
        expenseRepository.delete(expense);
    }

    private String generateExpenseNumber() {
        return "EXP-" + System.currentTimeMillis();
    }

    private Expense findExpense(Long id) {
        return expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
    }
}

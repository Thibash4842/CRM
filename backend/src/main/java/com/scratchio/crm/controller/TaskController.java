package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.TaskResponse;
import com.scratchio.crm.entity.enums.TaskStatus;
import com.scratchio.crm.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getAll(
            @RequestParam(required = false) TaskStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getAll(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> create(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.create(data)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.update(id, data)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taskService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted", null));
    }
}

package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.NotificationResponse;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.security.CustomUserDetailsService;
import com.scratchio.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CustomUserDetailsService userDetailsService;

    private Long getCurrentUserId() {
        User currentUser = userDetailsService.getCurrentUserEntity();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        return currentUser.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String sort) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotifications(userId, search, type, isRead, dateRange, sort)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotificationStats(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markRead(id, userId)));
    }

    @PutMapping("/{id}/unread")
    public ResponseEntity<ApiResponse<NotificationResponse>> markUnread(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markUnread(id, userId)));
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<ApiResponse<NotificationResponse>> archive(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.archive(id, userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        notificationService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Notification deleted successfully", null));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        Long userId = getCurrentUserId();
        notificationService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @PostMapping("/archive-all")
    public ResponseEntity<ApiResponse<Void>> archiveAll() {
        Long userId = getCurrentUserId();
        notificationService.archiveAll(userId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications archived", null));
    }

    @PostMapping("/delete-all")
    public ResponseEntity<ApiResponse<Void>> deleteAll() {
        Long userId = getCurrentUserId();
        notificationService.deleteAll(userId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications deleted", null));
    }

    @GetMapping("/ai-suggestions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAiSuggestions() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getAiSuggestions(userId)));
    }

    @PostMapping("/mock")
    public ResponseEntity<ApiResponse<NotificationResponse>> createMockNotification(
            @RequestParam(required = false) String type) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.createMockNotification(userId, type)));
    }
}

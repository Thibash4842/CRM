package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.NotificationResponse;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.security.CustomUserDetailsService;
import com.scratchio.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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

    // --- User Requested Endpoints ---

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) String dateRange,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getCurrentUserId();
        
        org.springframework.data.domain.Sort.Direction direction = org.springframework.data.domain.Sort.Direction.DESC;
        if (sort != null && sort.equalsIgnoreCase("oldest")) {
            direction = org.springframework.data.domain.Sort.Direction.ASC;
        }
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by(direction, "createdAt"));
        
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotifications(userId, search, type, isRead, dateRange, priority, pageable)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadNotifications(userId)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount(userId)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markAsRead(id, userId)));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Long userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Notification deleted successfully", null));
    }

    // --- Legacy / Internal Endpoints ---

    @DeleteMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> deleteReadNotifications() {
        Long userId = getCurrentUserId();
        notificationService.deleteReadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.ok("Read notifications deleted successfully", null));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getNotificationStats(userId)));
    }

    @PutMapping("/{id}/unread")
    public ResponseEntity<ApiResponse<NotificationResponse>> markUnread(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(notificationService.markUnread(id, userId)));
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
}

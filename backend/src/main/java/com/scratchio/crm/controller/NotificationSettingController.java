package com.scratchio.crm.controller;

import com.scratchio.crm.dto.NotificationSettingDTO;
import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.security.CustomUserDetailsService;
import com.scratchio.crm.service.NotificationSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notification-settings")
@RequiredArgsConstructor
public class NotificationSettingController {

    private final NotificationSettingService notificationSettingService;
    private final CustomUserDetailsService userDetailsService;

    private Long getCurrentUserId() {
        User currentUser = userDetailsService.getCurrentUserEntity();
        if (currentUser == null) {
            throw new IllegalStateException("User not authenticated");
        }
        return currentUser.getId();
    }

    /**
     * Return the authenticated user's notification settings. If none exist a default record is created.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<NotificationSettingDTO>> getSettings() {
        Long userId = getCurrentUserId();
        NotificationSettingDTO dto = notificationSettingService.getSettings(userId);
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    /**
     * Update the authenticated user's notification settings.
     * The request body can contain a full DTO or a partial one – null fields are ignored.
     */
    @PutMapping
    public ResponseEntity<ApiResponse<NotificationSettingDTO>> updateSettings(@RequestBody NotificationSettingDTO dto) {
        Long userId = getCurrentUserId();
        NotificationSettingDTO updated = notificationSettingService.updateSettings(userId, dto);
        return ResponseEntity.ok(ApiResponse.ok(updated));
    }
}

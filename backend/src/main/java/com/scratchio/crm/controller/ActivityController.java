package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.ApiResponse;
import com.scratchio.crm.dto.response.EntityMappers.ActivityResponse;
import com.scratchio.crm.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getActivities(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(ApiResponse.ok(activityService.getActivitiesForEntity(entityType, entityId)));
    }
}

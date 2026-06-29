package com.scratchio.crm.service;

import com.scratchio.crm.entity.Activity;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.repository.ActivityRepository;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.scratchio.crm.dto.response.EntityMappers.ActivityResponse;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final CustomUserDetailsService userDetailsService;

    @Transactional
    public void log(String entityType, Long entityId, ActivityType type, String title, String description) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Activity activity = Activity.builder()
                .type(type)
                .title(title)
                .description(description)
                .entityType(entityType)
                .entityId(entityId)
                .user(currentUser)
                .build();
        activityRepository.save(activity);
    }

    public List<ActivityResponse> getActivitiesForEntity(String entityType, Long entityId) {
        return activityRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId)
                .stream()
                .map(ActivityResponse::from)
                .collect(Collectors.toList());
    }
}

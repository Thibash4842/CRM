package com.scratchio.crm.service;

import com.scratchio.crm.dto.NotificationSettingDTO;
import com.scratchio.crm.entity.NotificationSetting;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.repository.NotificationSettingRepository;
import com.scratchio.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationSettingService {

    private final NotificationSettingRepository settingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public NotificationSettingDTO getSettings(Long userId) {
        NotificationSetting setting = settingRepository.findByUser_Id(userId)
                .orElseGet(() -> createDefaultSettings(userId));
        return toDto(setting);
    }

    @Transactional
    public NotificationSettingDTO updateSettings(Long userId, NotificationSettingDTO dto) {
        NotificationSetting setting = settingRepository.findByUser_Id(userId)
                .orElseGet(() -> createDefaultSettings(userId));
        // Apply updates (null values are ignored to allow partial updates)
        if (dto.getEnableBellAnimation() != null)
            setting.setEnableBellAnimation(dto.getEnableBellAnimation());
        if (dto.getEnableToastReminder() != null)
            setting.setEnableToastReminder(dto.getEnableToastReminder());
        if (dto.getReminderInterval() != null)
            setting.setReminderInterval(dto.getReminderInterval());
        if (dto.getEnableDesktopNotifications() != null)
            setting.setEnableDesktopNotifications(dto.getEnableDesktopNotifications());
        if (dto.getEnableNotificationSound() != null)
            setting.setEnableNotificationSound(dto.getEnableNotificationSound());
        if (dto.getDoNotDisturbEnabled() != null)
            setting.setDoNotDisturbEnabled(dto.getDoNotDisturbEnabled());
        if (dto.getDoNotDisturbStart() != null)
            setting.setDoNotDisturbStart(dto.getDoNotDisturbStart());
        if (dto.getDoNotDisturbEnd() != null)
            setting.setDoNotDisturbEnd(dto.getDoNotDisturbEnd());
        settingRepository.save(setting);
        return toDto(setting);
    }

    private NotificationSetting createDefaultSettings(@org.springframework.lang.NonNull Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        NotificationSetting defaultSetting = NotificationSetting.builder()
                .user(user)
                .enableBellAnimation(true)
                .enableToastReminder(true)
                .reminderInterval(5)
                .enableDesktopNotifications(true)
                .enableNotificationSound(true)
                .doNotDisturbEnabled(false)
                .doNotDisturbStart(null)
                .doNotDisturbEnd(null)
                .build();
        return settingRepository.save(defaultSetting);
    }

    private NotificationSettingDTO toDto(NotificationSetting entity) {
        NotificationSettingDTO dto = new NotificationSettingDTO();
        dto.setEnableBellAnimation(entity.getEnableBellAnimation());
        dto.setEnableToastReminder(entity.getEnableToastReminder());
        dto.setReminderInterval(entity.getReminderInterval());
        dto.setEnableDesktopNotifications(entity.getEnableDesktopNotifications());
        dto.setEnableNotificationSound(entity.getEnableNotificationSound());
        dto.setDoNotDisturbEnabled(entity.getDoNotDisturbEnabled());
        dto.setDoNotDisturbStart(entity.getDoNotDisturbStart());
        dto.setDoNotDisturbEnd(entity.getDoNotDisturbEnd());
        return dto;
    }
}

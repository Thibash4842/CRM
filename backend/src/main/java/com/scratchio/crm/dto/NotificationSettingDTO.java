package com.scratchio.crm.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class NotificationSettingDTO {
    @NotNull
    private Boolean enableBellAnimation;
    @NotNull
    private Boolean enableToastReminder;
    @NotNull
    private Integer reminderInterval; // minutes (5,10,15,30)
    @NotNull
    private Boolean enableDesktopNotifications;
    @NotNull
    private Boolean enableNotificationSound;
    @NotNull
    private Boolean doNotDisturbEnabled;
    private String doNotDisturbStart; // HH:mm
    private String doNotDisturbEnd;   // HH:mm
}

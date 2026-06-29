package com.scratchio.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "enable_bell_animation", nullable = false)
    private Boolean enableBellAnimation = true;

    @Builder.Default
    @Column(name = "enable_toast_reminder", nullable = false)
    private Boolean enableToastReminder = true;

    @Builder.Default
    @Column(name = "reminder_interval", nullable = false)
    private Integer reminderInterval = 5; // minutes

    @Builder.Default
    @Column(name = "enable_desktop_notifications", nullable = false)
    private Boolean enableDesktopNotifications = true;

    @Builder.Default
    @Column(name = "enable_notification_sound", nullable = false)
    private Boolean enableNotificationSound = true;

    @Builder.Default
    @Column(name = "do_not_disturb_enabled", nullable = false)
    private Boolean doNotDisturbEnabled = false;

    @Column(name = "do_not_disturb_start")
    private String doNotDisturbStart; // stored as HH:mm

    @Column(name = "do_not_disturb_end")
    private String doNotDisturbEnd;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

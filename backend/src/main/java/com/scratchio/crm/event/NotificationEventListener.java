package com.scratchio.crm.event;

import com.scratchio.crm.entity.User;
import com.scratchio.crm.repository.UserRepository;
import com.scratchio.crm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Async
    @EventListener
    @SuppressWarnings("null")
    public void handleCrmNotificationEvent(CrmNotificationEvent event) {
        User recipient = userRepository.findById(event.getRecipientId()).orElse(null);

        if (recipient != null) {
            notificationService.createNotification(
                    recipient,
                    event.getTitle(),
                    event.getMessage(),
                    event.getType(),
                    event.getPriority(),
                    event.getRelatedEntityType(),
                    event.getRelatedEntityId(),
                    event.getActionUrl()
            );
        }
    }
}

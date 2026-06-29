package com.scratchio.crm.event;

import com.scratchio.crm.entity.enums.NotificationPriority;
import com.scratchio.crm.entity.enums.NotificationType;
import com.scratchio.crm.entity.enums.RelatedEntityType;
import lombok.Builder;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CrmNotificationEvent extends ApplicationEvent {
    
    private final Long recipientId;
    private final Long createdById; // Optional, can be null
    private final String title;
    private final String message;
    private final NotificationType type;
    private final NotificationPriority priority;
    private final RelatedEntityType relatedEntityType;
    private final Long relatedEntityId;
    private final String actionUrl;

    @Builder
    public CrmNotificationEvent(Object source, Long recipientId, Long createdById, String title, 
                                String message, NotificationType type, NotificationPriority priority, 
                                RelatedEntityType relatedEntityType, Long relatedEntityId, String actionUrl) {
        super(source);
        this.recipientId = recipientId;
        this.createdById = createdById;
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority;
        this.relatedEntityType = relatedEntityType;
        this.relatedEntityId = relatedEntityId;
        this.actionUrl = actionUrl;
    }
}

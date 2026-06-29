package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.NotificationResponse;
import com.scratchio.crm.entity.*;
import com.scratchio.crm.entity.enums.*;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final TaskRepository taskRepository;
    private final DealRepository dealRepository;

    public Page<NotificationResponse> getNotifications(Long userId, String search, String type, Boolean isRead, String dateRange, String priority, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        Specification<Notification> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("recipientUser").get("id"), userId));

            if (search != null && !search.trim().isEmpty()) {
                String q = "%" + search.toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), q);
                Predicate descMatch = cb.like(cb.lower(root.get("message")), q);
                Predicate typeMatch = cb.like(cb.lower(root.get("notificationType").as(String.class)), q);
                Predicate entityMatch = cb.like(cb.lower(root.get("relatedEntityType").as(String.class)), q);
                predicates.add(cb.or(titleMatch, descMatch, typeMatch, entityMatch));
            }

            if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("all")) {
                if (type.equalsIgnoreCase("unread")) {
                    predicates.add(cb.equal(root.get("isRead"), false));
                } else {
                    List<NotificationType> types = new ArrayList<>();
                    switch (type.toLowerCase()) {
                        case "leads":
                            types.addAll(Arrays.asList(NotificationType.NEW_LEAD_ASSIGNED, NotificationType.LEAD_STATUS_CHANGED, NotificationType.FOLLOW_UP_REMINDER));
                            break;
                        case "tasks":
                            types.addAll(Arrays.asList(NotificationType.TASK_DUE, NotificationType.TASK_COMPLETED));
                            break;
                        case "meetings":
                            types.add(NotificationType.MEETING_REMINDER);
                            break;
                        case "calls":
                            types.add(NotificationType.CALL_REMINDER);
                            break;
                        case "deals":
                            types.addAll(Arrays.asList(NotificationType.DEAL_WON, NotificationType.DEAL_LOST));
                            break;
                        case "system":
                            types.add(NotificationType.SYSTEM_ALERT);
                            break;
                        case "mentions":
                            types.add(NotificationType.USER_MENTION);
                            break;
                        case "reminders":
                            types.addAll(Arrays.asList(NotificationType.FOLLOW_UP_REMINDER, NotificationType.MEETING_REMINDER, NotificationType.CALL_REMINDER));
                            break;
                        default:
                            try {
                                types.add(NotificationType.valueOf(type.toUpperCase()));
                            } catch (IllegalArgumentException e) {}
                            break;
                    }
                    if (!types.isEmpty()) {
                        predicates.add(root.get("notificationType").in(types));
                    }
                }
            }

            if (isRead != null) {
                predicates.add(cb.equal(root.get("isRead"), isRead));
            }

            if (priority != null && !priority.trim().isEmpty() && !priority.equalsIgnoreCase("all")) {
                try {
                    NotificationPriority p = NotificationPriority.valueOf(priority.toUpperCase());
                    predicates.add(cb.equal(root.get("priority"), p));
                } catch (IllegalArgumentException e) {
                    // ignore invalid priority
                }
            }

            if (dateRange != null && !dateRange.trim().isEmpty() && !dateRange.equalsIgnoreCase("all")) {
                LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
                LocalDateTime yesterdayStart = todayStart.minusDays(1);
                LocalDateTime weekStart = todayStart.minusDays(7);

                switch (dateRange.toLowerCase()) {
                    case "today":
                        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), todayStart));
                        break;
                    case "yesterday":
                        predicates.add(cb.and(
                                cb.greaterThanOrEqualTo(root.get("createdAt"), yesterdayStart),
                                cb.lessThan(root.get("createdAt"), todayStart)
                        ));
                        break;
                    case "this_week":
                        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), weekStart));
                        break;
                    case "this_month":
                        LocalDateTime monthStart = todayStart.withDayOfMonth(1);
                        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), monthStart));
                        break;
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return notificationRepository.findAll(spec, pageable).map(NotificationResponse::from);
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user)
                .stream().map(NotificationResponse::from).collect(Collectors.toList());
    }

    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findUnreadNotifications(user)
                .stream().map(NotificationResponse::from).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countUnreadNotifications(user);
    }

    public Map<String, Object> getNotificationStats(Long userId) {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long total = notificationRepository.countByRecipientUserId(userId);
        long unread = notificationRepository.countUnreadNotifications(user);
        long today = notificationRepository.countTodayNotifications(userId, todayStart);
        long highPriority = notificationRepository.countByRecipientUserIdAndPriority(userId, NotificationPriority.HIGH);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("unread", unread);
        stats.put("today", today);
        stats.put("highPriority", highPriority);
        return stats;
    }

    @Transactional
    public NotificationResponse markAsRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipientUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        notificationRepository.markNotificationRead(id);
        n.setIsRead(true);
        return NotificationResponse.from(n);
    }

    @Transactional
    public NotificationResponse markUnread(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipientUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        n.setIsRead(false);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public void deleteNotification(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipientUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        notificationRepository.deleteNotification(id);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.markAllRead(user);
    }

    @Transactional
    public void deleteAll(Long userId) {
        notificationRepository.deleteAllForRecipient(userId);
    }

    @Transactional
    public void deleteReadNotifications(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user).stream()
            .filter(Notification::getIsRead)
            .forEach(n -> notificationRepository.delete(n));
    }

    public List<Map<String, Object>> getAiSuggestions(Long userId) {
        List<Map<String, Object>> suggestions = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // 1. Leads without follow-up
        List<Lead> leads = leadRepository.findByAssignedToId(userId);
        List<Lead> neglectedLeads = leads.stream()
                .filter(l -> !l.getIsDeleted() && l.getStatus() != LeadStatus.WON && l.getStatus() != LeadStatus.LOST)
                .filter(l -> l.getFollowUpDate() == null)
                .limit(2)
                .toList();

        for (Lead l : neglectedLeads) {
            Map<String, Object> sug = new HashMap<>();
            sug.put("id", "lead-nofup-" + l.getId());
            sug.put("type", "lead");
            sug.put("title", "Neglected Lead Action Required");
            sug.put("description", "Lead \"" + l.getFullName() + "\" at " + (l.getCompany() != null ? l.getCompany() : "N/A") + " has no scheduled follow-up. Setting one is recommended.");
            sug.put("actionLink", "/leads/edit/" + l.getId());
            sug.put("severity", "medium");
            suggestions.add(sug);
        }

        // 2. Overdue tasks
        List<Task> tasks = taskRepository.findByAssignedToId(userId);
        List<Task> overdueTasks = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(now))
                .limit(2)
                .toList();

        for (Task t : overdueTasks) {
            Map<String, Object> sug = new HashMap<>();
            sug.put("id", "task-overdue-" + t.getId());
            sug.put("type", "task");
            sug.put("title", "Task Overdue");
            sug.put("description", "Task \"" + t.getTitle() + "\" was due on " + t.getDueDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + ".");
            sug.put("actionLink", "/activities/tasks");
            sug.put("severity", "high");
            suggestions.add(sug);
        }

        // 3. Upcoming meetings
        List<Task> meetings = tasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .filter(t -> t.getTitle().toLowerCase().contains("meeting") || t.getTitle().toLowerCase().contains("sync"))
                .filter(t -> t.getDueDate() != null && t.getDueDate().isAfter(now) && t.getDueDate().isBefore(now.plusDays(2)))
                .limit(1)
                .toList();

        for (Task m : meetings) {
            Map<String, Object> sug = new HashMap<>();
            sug.put("id", "meeting-up-" + m.getId());
            sug.put("type", "meeting");
            sug.put("title", "Upcoming Meeting Preparation");
            sug.put("description", "You have a meeting \"" + m.getTitle() + "\" scheduled for " + m.getDueDate().format(DateTimeFormatter.ofPattern("MMM dd, HH:mm")) + ". Review client details.");
            sug.put("actionLink", "/activities/meetings");
            sug.put("severity", "low");
            suggestions.add(sug);
        }

        // 4. At-risk deals
        List<Deal> deals = dealRepository.findByAssignedToId(userId);
        List<Deal> atRiskDeals = deals.stream()
                .filter(d -> d.getStage() != DealStage.WON && d.getStage() != DealStage.LOST)
                .filter(d -> d.getExpectedCloseDate() != null && d.getExpectedCloseDate().isBefore(LocalDate.now()))
                .limit(1)
                .toList();

        for (Deal d : atRiskDeals) {
            Map<String, Object> sug = new HashMap<>();
            sug.put("id", "deal-atrisk-" + d.getId());
            sug.put("type", "deal");
            sug.put("title", "Deal Closing Date Elapsed");
            sug.put("description", "Deal \"" + d.getTitle() + "\" value of $" + d.getValue() + " has elapsed its estimated closing date of " + d.getExpectedCloseDate() + ".");
            sug.put("actionLink", "/deals");
            sug.put("severity", "high");
            suggestions.add(sug);
        }

        if (suggestions.isEmpty()) {
            Map<String, Object> sug = new HashMap<>();
            sug.put("id", "static-1");
            sug.put("type", "system");
            sug.put("title", "Optimize Lead Pipeline");
            sug.put("description", "You have 5 new leads in the pipeline today. Contact them within 24 hours to maximize conversion rates.");
            sug.put("actionLink", "/leads");
            sug.put("severity", "low");
            suggestions.add(sug);
        }

        return suggestions;
    }

    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createNotification(User recipientUser, String title, String message, 
                                   NotificationType notificationType, NotificationPriority priority,
                                   RelatedEntityType relatedEntityType, Long relatedEntityId, String actionUrl) {
        if (recipientUser == null) return;
        
        Notification n = Notification.builder()
                .recipientUser(recipientUser)
                .title(title)
                .message(message)
                .notificationType(notificationType)
                .priority(priority)
                .relatedEntityType(relatedEntityType)
                .relatedEntityId(relatedEntityId)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(n);
        
        // Broadcast via WebSocket
        messagingTemplate.convertAndSendToUser(
                recipientUser.getEmail(), 
                "/queue/notifications", 
                NotificationResponse.from(saved)
        );
    }
}

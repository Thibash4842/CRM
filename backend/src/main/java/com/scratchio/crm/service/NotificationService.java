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

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final TaskRepository taskRepository;
    private final DealRepository dealRepository;

    public List<NotificationResponse> getNotifications(Long userId, String search, String type, Boolean isRead, String dateRange, String sort) {
        // Ensure user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Notification> list = notificationRepository.findByRecipientIdAndIsArchivedOrderByCreatedAtDesc(userId, false);

        // Prepopulate if empty to showcase a beautiful SaaS UI
        if (list.isEmpty()) {
            prepopulateMockNotifications(user);
            list = notificationRepository.findByRecipientIdAndIsArchivedOrderByCreatedAtDesc(userId, false);
        }

        // Apply filters in memory
        return list.stream()
                .filter(n -> {
                    if (search != null && !search.trim().isEmpty()) {
                        String q = search.toLowerCase();
                        boolean matchTitle = n.getTitle() != null && n.getTitle().toLowerCase().contains(q);
                        boolean matchDesc = n.getDescription() != null && n.getDescription().toLowerCase().contains(q);
                        return matchTitle || matchDesc;
                    }
                    return true;
                })
                .filter(n -> {
                    if (type != null && !type.trim().isEmpty() && !type.equalsIgnoreCase("all")) {
                        if (type.equalsIgnoreCase("unread")) {
                            return !n.getIsRead();
                        }
                        // Map type filter to NotificationType groups
                        NotificationType nt = n.getType();
                        switch (type.toLowerCase()) {
                            case "leads":
                                return nt == NotificationType.NEW_LEAD_ASSIGNED || nt == NotificationType.LEAD_STATUS_CHANGED || nt == NotificationType.FOLLOW_UP_REMINDER;
                            case "tasks":
                                return nt == NotificationType.TASK_DUE || nt == NotificationType.TASK_COMPLETED;
                            case "meetings":
                                return nt == NotificationType.MEETING_REMINDER;
                            case "calls":
                                return nt == NotificationType.CALL_REMINDER;
                            case "deals":
                                return nt == NotificationType.DEAL_WON || nt == NotificationType.DEAL_LOST;
                            case "system":
                                return nt == NotificationType.SYSTEM_ALERT;
                            default:
                                return nt.name().equalsIgnoreCase(type);
                        }
                    }
                    return true;
                })
                .filter(n -> {
                    if (isRead != null) {
                        return n.getIsRead().equals(isRead);
                    }
                    return true;
                })
                .filter(n -> {
                    if (dateRange != null && !dateRange.trim().isEmpty() && !dateRange.equalsIgnoreCase("all")) {
                        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
                        LocalDateTime yesterdayStart = todayStart.minusDays(1);
                        LocalDateTime weekStart = todayStart.minusDays(7);

                        switch (dateRange.toLowerCase()) {
                            case "today":
                                return n.getCreatedAt().isAfter(todayStart);
                            case "yesterday":
                                return n.getCreatedAt().isAfter(yesterdayStart) && n.getCreatedAt().isBefore(todayStart);
                            case "this_week":
                                return n.getCreatedAt().isAfter(weekStart);
                            case "older":
                                return n.getCreatedAt().isBefore(weekStart);
                            default:
                                return true;
                        }
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    if (sort != null && sort.equalsIgnoreCase("oldest")) {
                        return a.getCreatedAt().compareTo(b.getCreatedAt());
                    }
                    // default is newest first
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getNotificationStats(Long userId) {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

        long total = notificationRepository.countByRecipientIdAndIsArchivedFalse(userId);
        long unread = notificationRepository.countByRecipientIdAndIsReadFalseAndIsArchivedFalse(userId);
        long today = notificationRepository.countTodayNotifications(userId, todayStart);
        long highPriority = notificationRepository.countByRecipientIdAndIsArchivedFalseAndPriority(userId, NotificationPriority.HIGH);

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("unread", unread);
        stats.put("today", today);
        stats.put("highPriority", highPriority);
        return stats;
    }

    @Transactional
    public NotificationResponse markRead(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        n.setIsRead(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public NotificationResponse markUnread(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        n.setIsRead(false);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public NotificationResponse archive(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        n.setIsArchived(true);
        return NotificationResponse.from(notificationRepository.save(n));
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized");
        }
        notificationRepository.delete(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadForRecipient(userId);
    }

    @Transactional
    public void archiveAll(Long userId) {
        notificationRepository.archiveAllForRecipient(userId);
    }

    @Transactional
    public void deleteAll(Long userId) {
        notificationRepository.deleteAllForRecipient(userId);
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

        // Add default static recommendations if nothing dynamic is found
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

    @Transactional
    public NotificationResponse createMockNotification(Long userId, String customType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NotificationType[] types = NotificationType.values();
        NotificationType selectedType = types[new Random().nextInt(types.length)];
        if (customType != null && !customType.trim().isEmpty()) {
            try {
                selectedType = NotificationType.valueOf(customType.toUpperCase());
            } catch (Exception ignored) {}
        }

        NotificationPriority priority = NotificationPriority.values()[new Random().nextInt(NotificationPriority.values().length)];

        String title = "";
        String description = "";
        String relatedRecordName = "";
        String relatedRecordLink = "";

        switch (selectedType) {
            case NEW_LEAD_ASSIGNED:
                title = "New Lead Assigned";
                description = "A new premium lead from Acme Corp has been routed to your queue.";
                relatedRecordName = "Acme Corporation";
                relatedRecordLink = "/leads";
                priority = NotificationPriority.HIGH;
                break;
            case LEAD_STATUS_CHANGED:
                title = "Lead Status Updated";
                description = "Lead Jane Doe has progressed from 'CONTACTED' to 'QUALIFIED'.";
                relatedRecordName = "Jane Doe";
                relatedRecordLink = "/leads";
                break;
            case FOLLOW_UP_REMINDER:
                title = "Follow-up Call Scheduled";
                description = "It's time to follow up with John Smith regarding the enterprise license demo.";
                relatedRecordName = "John Smith";
                relatedRecordLink = "/leads";
                break;
            case TASK_DUE:
                title = "Task Deadline Nearing";
                description = "Task 'Upload signed project contract' is due in 3 hours.";
                relatedRecordName = "Project Contract.pdf";
                relatedRecordLink = "/activities/tasks";
                priority = NotificationPriority.HIGH;
                break;
            case TASK_COMPLETED:
                title = "Task Completed";
                description = "Collaborator Sarah finished the task 'Prepare deck for quarterly review'.";
                relatedRecordName = "Quarterly Review Deck";
                relatedRecordLink = "/activities/tasks";
                break;
            case MEETING_REMINDER:
                title = "Meeting Starting Soon";
                description = "Product Sync meeting with Developer Team begins in 10 minutes.";
                relatedRecordName = "Product Sync";
                relatedRecordLink = "/activities/meetings";
                break;
            case CALL_REMINDER:
                title = "Upcoming Call Alert";
                description = "Scheduled introductory call with Microsoft Sales Executive in 15 minutes.";
                relatedRecordName = "Intro Call (Microsoft)";
                relatedRecordLink = "/activities/calls";
                break;
            case DEAL_WON:
                title = "Deal Won! 🎉";
                description = "Congratulations! Enterprise deal with Stark Industries valued at $120,000 has been closed-won.";
                relatedRecordName = "Stark Industries Expansion";
                relatedRecordLink = "/deals";
                priority = NotificationPriority.HIGH;
                break;
            case DEAL_LOST:
                title = "Deal Closed Lost";
                description = "Deal with Oscorp of $45,000 marked as lost due to budget constraints.";
                relatedRecordName = "Oscorp Biotech Integration";
                relatedRecordLink = "/deals";
                break;
            case SYSTEM_ALERT:
                title = "System Maintenance Scheduled";
                description = "ScratchIO CRM will undergo scheduled maintenance this Sunday from 2 AM to 4 AM UTC.";
                relatedRecordName = "System Maintenance";
                relatedRecordLink = "/settings";
                priority = NotificationPriority.LOW;
                break;
            case USER_MENTION:
                title = "Mentioned in Comments";
                description = "@alex mentioned you: 'Please review the pricing proposal for Google Deal before the meeting.'";
                relatedRecordName = "Google Workspace Deal";
                relatedRecordLink = "/deals";
                priority = NotificationPriority.HIGH;
                break;
        }

        Notification n = Notification.builder()
                .recipient(user)
                .title(title)
                .description(description)
                .type(selectedType)
                .priority(priority)
                .relatedRecordName(relatedRecordName)
                .relatedRecordLink(relatedRecordLink)
                .isRead(false)
                .isArchived(false)
                .createdAt(LocalDateTime.now())
                .build();

        return NotificationResponse.from(notificationRepository.save(n));
    }

    private void prepopulateMockNotifications(User user) {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> initial = List.of(
                Notification.builder()
                        .recipient(user)
                        .title("New Lead Assigned")
                        .description("A high-value lead 'Alice Johnson' from Tesla was assigned to you.")
                        .type(NotificationType.NEW_LEAD_ASSIGNED)
                        .priority(NotificationPriority.HIGH)
                        .relatedRecordName("Alice Johnson (Tesla)")
                        .relatedRecordLink("/leads")
                        .isRead(false)
                        .isArchived(false)
                        .createdAt(now.minusMinutes(12))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("Deal Won! 🎉")
                        .description("The deal with Wayne Enterprises ($250,000) has been closed-won!")
                        .type(NotificationType.DEAL_WON)
                        .priority(NotificationPriority.HIGH)
                        .relatedRecordName("Wayne Tech Upgrade")
                        .relatedRecordLink("/deals")
                        .isRead(false)
                        .isArchived(false)
                        .createdAt(now.minusHours(2))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("Mentioned in Lead Comments")
                        .description("Sarah mentioned you: 'Can you double check the phone number for Bob?'")
                        .type(NotificationType.USER_MENTION)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedRecordName("Bob Miller")
                        .relatedRecordLink("/leads")
                        .isRead(false)
                        .isArchived(false)
                        .createdAt(now.minusHours(4))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("Meeting in 15 Minutes")
                        .description("Follow-up demo with SpaceX project managers is starting soon.")
                        .type(NotificationType.MEETING_REMINDER)
                        .priority(NotificationPriority.HIGH)
                        .relatedRecordName("SpaceX Follow-up Demo")
                        .relatedRecordLink("/activities/meetings")
                        .isRead(false)
                        .isArchived(false)
                        .createdAt(now.minusMinutes(15))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("Task Completed")
                        .description("Task 'Update proposal pricing table' was completed by system automation.")
                        .type(NotificationType.TASK_COMPLETED)
                        .priority(NotificationPriority.LOW)
                        .relatedRecordName("Proposal pricing table")
                        .relatedRecordLink("/activities/tasks")
                        .isRead(true)
                        .isArchived(false)
                        .createdAt(now.minusDays(1).minusHours(1))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("Task Due Tomorrow")
                        .description("Task 'Follow up with Netflix HR team' is due tomorrow at 10 AM.")
                        .type(NotificationType.TASK_DUE)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedRecordName("Netflix Follow-up Task")
                        .relatedRecordLink("/activities/tasks")
                        .isRead(true)
                        .isArchived(false)
                        .createdAt(now.minusDays(1).minusHours(6))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("System Maintenance Alert")
                        .description("Database performance scaling will run on Saturday at 1 AM PST. Expect minor latency.")
                        .type(NotificationType.SYSTEM_ALERT)
                        .priority(NotificationPriority.LOW)
                        .relatedRecordName("Database Scaling")
                        .relatedRecordLink("/settings")
                        .isRead(true)
                        .isArchived(false)
                        .createdAt(now.minusDays(3))
                        .build(),
                Notification.builder()
                        .recipient(user)
                        .title("Lead Status Changed")
                        .description("Lead 'Tony Stark' has been moved to Status 'CONTACTED'.")
                        .type(NotificationType.LEAD_STATUS_CHANGED)
                        .priority(NotificationPriority.MEDIUM)
                        .relatedRecordName("Tony Stark")
                        .relatedRecordLink("/leads")
                        .isRead(true)
                        .isArchived(false)
                        .createdAt(now.minusDays(5))
                        .build()
        );

        notificationRepository.saveAll(initial);
    }
}

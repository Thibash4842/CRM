package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.TaskResponse;
import com.scratchio.crm.entity.Task;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.TaskPriority;
import com.scratchio.crm.entity.enums.TaskStatus;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.*;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.time.LocalDate;
import com.scratchio.crm.entity.enums.NotificationType;
import com.scratchio.crm.entity.enums.NotificationPriority;
import com.scratchio.crm.entity.enums.RelatedEntityType;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final DealRepository dealRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;
    private final NotificationService notificationService;

    public List<TaskResponse> getAll(TaskStatus status) {
        List<Task> tasks = status != null ? taskRepository.findByStatus(status) : taskRepository.findAll();
        return tasks.stream().map(TaskResponse::from).collect(Collectors.toList());
    }

    public TaskResponse getById(Long id) {
        return TaskResponse.from(findTask(id));
    }

    @Transactional
    public TaskResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Task task = Task.builder()
                .title((String) data.get("title"))
                .description((String) data.get("description"))
                .dueDate(data.get("dueDate") != null ? LocalDateTime.parse((String) data.get("dueDate")) : null)
                .priority(data.get("priority") != null ? TaskPriority.valueOf((String) data.get("priority")) : TaskPriority.MEDIUM)
                .status(data.get("status") != null ? TaskStatus.valueOf((String) data.get("status")) : TaskStatus.PENDING)
                .reminderAt(data.get("reminderAt") != null ? LocalDateTime.parse((String) data.get("reminderAt")) : null)
                .createdBy(currentUser)
                .build();

        linkRelations(task, data);
        task = taskRepository.save(task);
        activityService.log("TASK", task.getId(), ActivityType.CREATED, "Task created", task.getTitle());
        
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    task.getAssignedTo(),
                    "New Task Assigned",
                    "You have been assigned a new task: " + task.getTitle(),
                    NotificationType.TASK_ASSIGNED,
                    NotificationPriority.HIGH,
                    RelatedEntityType.TASK,
                    task.getId(),
                    "/tasks/" + task.getId()
            );
        } else {
            notificationService.createNotification(
                    currentUser,
                    "Task Created",
                    "Task created successfully: " + task.getTitle(),
                    NotificationType.SYSTEM_ALERT,
                    NotificationPriority.LOW,
                    RelatedEntityType.TASK,
                    task.getId(),
                    "/tasks/" + task.getId()
            );
        }
        
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse update(Long id, Map<String, Object> data) {
        Task task = findTask(id);

        Long oldAssigneeId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
        TaskStatus oldStatus = task.getStatus();

        if (data.containsKey("title")) task.setTitle((String) data.get("title"));
        if (data.containsKey("description")) task.setDescription((String) data.get("description"));
        if (data.containsKey("dueDate")) {
            task.setDueDate(data.get("dueDate") != null ? LocalDateTime.parse((String) data.get("dueDate")) : null);
        }
        if (data.containsKey("priority")) task.setPriority(TaskPriority.valueOf((String) data.get("priority")));
        if (data.containsKey("status")) task.setStatus(TaskStatus.valueOf((String) data.get("status")));
        if (data.containsKey("reminderAt")) {
            task.setReminderAt(data.get("reminderAt") != null ? LocalDateTime.parse((String) data.get("reminderAt")) : null);
        }
        linkRelations(task, data);

        task = taskRepository.save(task);
        
        User currentUser = userDetailsService.getCurrentUserEntity();
        Long newAssigneeId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
        
        if (newAssigneeId != null && !newAssigneeId.equals(oldAssigneeId) && !newAssigneeId.equals(currentUser.getId())) {
            notificationService.createNotification(
                    task.getAssignedTo(),
                    "Task Reassigned",
                    "Task " + task.getTitle() + " was assigned to you.",
                    NotificationType.TASK_ASSIGNED,
                    NotificationPriority.HIGH,
                    RelatedEntityType.TASK,
                    task.getId(),
                    "/tasks/" + task.getId()
            );
        }
        
        if (oldStatus != TaskStatus.COMPLETED && task.getStatus() == TaskStatus.COMPLETED) {
            if (task.getAssignedTo() != null) {
                notificationService.createNotification(
                        task.getAssignedTo(),
                        "Task Completed",
                        "Task " + task.getTitle() + " has been marked as completed.",
                        NotificationType.TASK_COMPLETED,
                        NotificationPriority.LOW,
                        RelatedEntityType.TASK,
                        task.getId(),
                        "/tasks/" + task.getId()
                );
            }
        }
        
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long id) {
        Task task = findTask(id);
        taskRepository.delete(task);
        
        if (task.getAssignedTo() != null) {
            notificationService.createNotification(
                    task.getAssignedTo(),
                    "Task Deleted",
                    "Task '" + task.getTitle() + "' has been deleted.",
                    NotificationType.SYSTEM_ALERT,
                    NotificationPriority.HIGH,
                    RelatedEntityType.TASK,
                    task.getId(),
                    null
            );
        }
    }

    private void linkRelations(Task task, Map<String, Object> data) {
        if (data.containsKey("assignedToId") && data.get("assignedToId") != null) {
            task.setAssignedTo(userRepository.findById(((Number) data.get("assignedToId")).longValue()).orElse(null));
        }
        if (data.containsKey("leadId") && data.get("leadId") != null) {
            task.setLead(leadRepository.findById(((Number) data.get("leadId")).longValue()).orElse(null));
        }
        if (data.containsKey("dealId") && data.get("dealId") != null) {
            task.setDeal(dealRepository.findById(((Number) data.get("dealId")).longValue()).orElse(null));
        }
        if (data.containsKey("clientId") && data.get("clientId") != null) {
            task.setClient(clientRepository.findById(((Number) data.get("clientId")).longValue()).orElse(null));
        }
        if (data.containsKey("projectId") && data.get("projectId") != null) {
            task.setProject(projectRepository.findById(((Number) data.get("projectId")).longValue()).orElse(null));
        }
    }

    private Task findTask(Long id) {
        return taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    @Scheduled(cron = "0 0 8 * * *") // Run every day at 8:00 AM
    @Transactional
    public void scheduleDailyTaskNotifications() {
        LocalDate today = LocalDate.now();
        List<Task> pendingTasks = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getAssignedTo() != null)
                .collect(Collectors.toList());

        for (Task task : pendingTasks) {
            if (task.getDueDate() != null) {
                LocalDate dueDate = task.getDueDate().toLocalDate();
                if (dueDate.isEqual(today)) {
                    notificationService.createNotification(
                            task.getAssignedTo(),
                            "Task Due Today",
                            "Task '" + task.getTitle() + "' is due today.",
                            NotificationType.TASK_DUE,
                            NotificationPriority.HIGH,
                            RelatedEntityType.TASK,
                            task.getId(),
                            "/tasks/" + task.getId()
                    );
                } else if (dueDate.isBefore(today)) {
                    notificationService.createNotification(
                            task.getAssignedTo(),
                            "Task Overdue",
                            "Task '" + task.getTitle() + "' is overdue!",
                            NotificationType.TASK_OVERDUE,
                            NotificationPriority.HIGH,
                            RelatedEntityType.TASK,
                            task.getId(),
                            "/tasks/" + task.getId()
                    );
                }
            }
        }
    }

    @Scheduled(cron = "0 * * * * *") // Run every minute
    @Transactional
    public void scheduleMinuteTaskReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMinuteAgo = now.minusMinutes(1);
        
        List<Task> tasksWithReminders = taskRepository.findAll().stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getAssignedTo() != null && t.getReminderAt() != null)
                .collect(Collectors.toList());

        for (Task task : tasksWithReminders) {
            // If reminder time is within the last minute (to avoid sending it repeatedly)
            if (task.getReminderAt().isAfter(oneMinuteAgo) && task.getReminderAt().isBefore(now.plusSeconds(1))) {
                notificationService.createNotification(
                        task.getAssignedTo(),
                        "Task Reminder",
                        "Reminder for task: " + task.getTitle(),
                        NotificationType.TASK_DUE,
                        NotificationPriority.MEDIUM,
                        RelatedEntityType.TASK,
                        task.getId(),
                        "/tasks/" + task.getId()
                );
            }
        }
    }
}

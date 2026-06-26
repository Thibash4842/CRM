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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final DealRepository dealRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;

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
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse update(Long id, Map<String, Object> data) {
        Task task = findTask(id);

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
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(findTask(id));
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
}

package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Task;
import com.scratchio.crm.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByLeadId(Long leadId);
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByStatus(TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.status != 'COMPLETED' AND t.dueDate >= :now ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasks(LocalDateTime now);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND t.status != 'COMPLETED' AND t.dueDate >= :now ORDER BY t.dueDate ASC")
    List<Task> findUpcomingTasksByUser(Long userId, LocalDateTime now);
}

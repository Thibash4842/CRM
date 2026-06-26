package com.scratchio.crm.repository;

import com.scratchio.crm.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<CalendarEvent> findByOwnerIdAndStartTimeBetween(Long ownerId, LocalDateTime start, LocalDateTime end);
}

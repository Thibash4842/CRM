package com.scratchio.crm.controller;

import com.scratchio.crm.dto.response.EntityMappers.CalendarEventResponse;
import com.scratchio.crm.service.CalendarEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/calendar")
@RequiredArgsConstructor
public class CalendarEventController {

    private final CalendarEventService calendarEventService;

    @GetMapping
    public ResponseEntity<List<CalendarEventResponse>> getEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false, defaultValue = "false") Boolean ownOnly) {
        return ResponseEntity.ok(calendarEventService.getEventsBetween(start, end, ownOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarEventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(calendarEventService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CalendarEventResponse> createEvent(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(calendarEventService.create(data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarEventResponse> updateEvent(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(calendarEventService.update(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        calendarEventService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

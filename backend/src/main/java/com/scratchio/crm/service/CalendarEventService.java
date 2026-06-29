package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.CalendarEventResponse;
import com.scratchio.crm.entity.CalendarEvent;
import com.scratchio.crm.entity.Deal;
import com.scratchio.crm.entity.Lead;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.EventStatus;
import com.scratchio.crm.entity.enums.EventType;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.CalendarEventRepository;
import com.scratchio.crm.repository.DealRepository;
import com.scratchio.crm.repository.LeadRepository;
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
@SuppressWarnings("null")
public class CalendarEventService {

    private final CalendarEventRepository calendarEventRepository;
    private final CustomUserDetailsService userDetailsService;
    private final LeadRepository leadRepository;
    private final DealRepository dealRepository;

    public List<CalendarEventResponse> getEventsBetween(LocalDateTime start, LocalDateTime end, Boolean ownOnly) {
        if (Boolean.TRUE.equals(ownOnly)) {
            User currentUser = userDetailsService.getCurrentUserEntity();
            return calendarEventRepository.findByOwnerIdAndStartTimeBetween(currentUser.getId(), start, end)
                    .stream().map(CalendarEventResponse::from).collect(Collectors.toList());
        } else {
            return calendarEventRepository.findByStartTimeBetween(start, end)
                    .stream().map(CalendarEventResponse::from).collect(Collectors.toList());
        }
    }

    public CalendarEventResponse getById(Long id) {
        return CalendarEventResponse.from(findEvent(id));
    }

    @Transactional
    public CalendarEventResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();

        CalendarEvent event = CalendarEvent.builder()
                .title((String) data.get("title"))
                .description((String) data.get("description"))
                .eventType(data.get("eventType") != null ? EventType.valueOf((String) data.get("eventType")) : EventType.MEETING)
                .startTime(parseDateTime((String) data.get("startTime")))
                .endTime(parseDateTime((String) data.get("endTime")))
                .isAllDay(data.get("isAllDay") != null && (Boolean) data.get("isAllDay"))
                .location((String) data.get("location"))
                .meetingUrl((String) data.get("meetingUrl"))
                .status(data.get("status") != null ? EventStatus.valueOf((String) data.get("status")) : EventStatus.SCHEDULED)
                .owner(currentUser)
                .build();

        if (data.get("contactId") != null) {
            Long leadId = ((Number) data.get("contactId")).longValue();
            Lead lead = leadRepository.findById(leadId).orElse(null);
            event.setContact(lead);
        }
        if (data.get("dealId") != null) {
            Long dealId = ((Number) data.get("dealId")).longValue();
            Deal deal = dealRepository.findById(dealId).orElse(null);
            event.setDeal(deal);
        }

        event = calendarEventRepository.save(event);
        return CalendarEventResponse.from(event);
    }

    @Transactional
    public CalendarEventResponse update(Long id, Map<String, Object> data) {
        CalendarEvent event = findEvent(id);

        if (data.containsKey("title")) event.setTitle((String) data.get("title"));
        if (data.containsKey("description")) event.setDescription((String) data.get("description"));
        if (data.containsKey("eventType")) event.setEventType(EventType.valueOf((String) data.get("eventType")));
        if (data.containsKey("startTime")) event.setStartTime(parseDateTime((String) data.get("startTime")));
        if (data.containsKey("endTime")) event.setEndTime(parseDateTime((String) data.get("endTime")));
        if (data.containsKey("isAllDay")) event.setAllDay((Boolean) data.get("isAllDay"));
        if (data.containsKey("location")) event.setLocation((String) data.get("location"));
        if (data.containsKey("meetingUrl")) event.setMeetingUrl((String) data.get("meetingUrl"));
        if (data.containsKey("status")) event.setStatus(EventStatus.valueOf((String) data.get("status")));

        if (data.containsKey("contactId")) {
            Object cid = data.get("contactId");
            if (cid == null) event.setContact(null);
            else event.setContact(leadRepository.findById(((Number) cid).longValue()).orElse(null));
        }

        if (data.containsKey("dealId")) {
            Object did = data.get("dealId");
            if (did == null) event.setDeal(null);
            else event.setDeal(dealRepository.findById(((Number) did).longValue()).orElse(null));
        }

        event = calendarEventRepository.save(event);
        return CalendarEventResponse.from(event);
    }

    @Transactional
    public void delete(Long id) {
        CalendarEvent event = findEvent(id);
        calendarEventRepository.delete(event);
    }

    private CalendarEvent findEvent(Long id) {
        return calendarEventRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }

    private LocalDateTime parseDateTime(String dtString) {
        if (dtString == null) return null;
        try {
            return LocalDateTime.parse(dtString, java.time.format.DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dtString, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX"));
            } catch (Exception ex) {
                return LocalDateTime.parse(dtString);
            }
        }
    }
}

package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.LeadResponse;
import com.scratchio.crm.entity.Lead;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.LeadStatus;
import com.scratchio.crm.entity.enums.LeadPriority;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.ClientRepository;
import com.scratchio.crm.repository.DealRepository;
import com.scratchio.crm.repository.LeadRepository;
import com.scratchio.crm.repository.TaskRepository;
import com.scratchio.crm.repository.UserRepository;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.scratchio.crm.entity.enums.NotificationType;
import com.scratchio.crm.entity.enums.NotificationPriority;
import com.scratchio.crm.entity.enums.RelatedEntityType;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;
    private final ClientService clientService;
    private final ClientRepository clientRepository;
    private final DealRepository dealRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public List<LeadResponse> getAll(String search, LeadStatus status, String source) {
        Specification<Lead> spec = (root, query, cb) -> cb.isFalse(root.get("isDeleted"));

        if (search != null && !search.isBlank()) {
            String term = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), term),
                    cb.like(cb.lower(root.get("lastName")), term),
                    cb.like(cb.lower(root.get("email")), term),
                    cb.like(cb.lower(root.get("company")), term)
            ));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (source != null && !source.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("source"), source));
        }

        return leadRepository.findAll(spec).stream().map(LeadResponse::from).collect(Collectors.toList());
    }

    public LeadResponse getById(Long id) {
        return LeadResponse.from(findLead(id));
    }

    @Transactional
    public LeadResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Lead lead = Lead.builder()
                .firstName((String) data.get("firstName"))
                .lastName((String) data.get("lastName"))
                .email((String) data.get("email"))
                .phone((String) data.get("phone"))
                .company((String) data.get("company"))
                .jobTitle((String) data.get("jobTitle"))
                .source((String) data.get("source"))
                .status(data.get("status") != null ? LeadStatus.valueOf((String) data.get("status")) : LeadStatus.NEW)
                .notes((String) data.get("notes"))
                .createdBy(currentUser)
                .priority(data.get("priority") != null ? LeadPriority.valueOf((String) data.get("priority")) : LeadPriority.COLD)
                .build();

        if (data.get("assignedToId") != null) {
            lead.setAssignedTo(userRepository.findById(((Number) data.get("assignedToId")).longValue()).orElse(null));
        }

        lead = leadRepository.save(lead);
        activityService.log("LEAD", lead.getId(), ActivityType.CREATED, "Lead created", lead.getFullName());

        if (lead.getAssignedTo() != null && !lead.getAssignedTo().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    lead.getAssignedTo(),
                    "New Lead Assigned",
                    "You have been assigned a new lead: " + lead.getFullName(),
                    NotificationType.NEW_LEAD_ASSIGNED,
                    NotificationPriority.HIGH,
                    RelatedEntityType.LEAD,
                    lead.getId(),
                    "/leads/" + lead.getId()
            );
        } else if (lead.getAssignedTo() == null || lead.getAssignedTo().getId().equals(currentUser.getId())) {
            // Self-assigned or unassigned, optionally notify creator if they want it
            notificationService.createNotification(
                    currentUser,
                    "Lead Created",
                    "You created a new lead: " + lead.getFullName(),
                    NotificationType.SYSTEM_ALERT,
                    NotificationPriority.LOW,
                    RelatedEntityType.LEAD,
                    lead.getId(),
                    "/leads/" + lead.getId()
            );
        }

        return LeadResponse.from(lead);
    }

    @Transactional
    public LeadResponse update(Long id, Map<String, Object> data) {
        Lead lead = findLead(id);
        StringBuilder changes = new StringBuilder();

        autoTrackChange(data, "firstName", lead.getFirstName(), val -> lead.setFirstName((String) val), changes, "First Name");
        autoTrackChange(data, "lastName", lead.getLastName(), val -> lead.setLastName((String) val), changes, "Last Name");
        autoTrackChange(data, "email", lead.getEmail(), val -> lead.setEmail((String) val), changes, "Email");
        autoTrackChange(data, "phone", lead.getPhone(), val -> lead.setPhone((String) val), changes, "Phone");
        autoTrackChange(data, "company", lead.getCompany(), val -> lead.setCompany((String) val), changes, "Company");
        autoTrackChange(data, "jobTitle", lead.getJobTitle(), val -> lead.setJobTitle((String) val), changes, "Job Title");
        autoTrackChange(data, "source", lead.getSource(), val -> lead.setSource((String) val), changes, "Source");
        autoTrackChange(data, "notes", lead.getNotes(), val -> lead.setNotes((String) val), changes, "Notes");
        
        if (data.containsKey("status")) {
            LeadStatus newStatus = LeadStatus.valueOf((String) data.get("status"));
            if (lead.getStatus() != newStatus) {
                changes.append("Status updated from ").append(lead.getStatus()).append(" to ").append(newStatus).append(". ");
                lead.setStatus(newStatus);

                if (lead.getAssignedTo() != null) {
                    notificationService.createNotification(
                            lead.getAssignedTo(),
                            "Lead Status Changed",
                            "Lead " + lead.getFullName() + " status changed to " + newStatus,
                            NotificationType.LEAD_STATUS_CHANGED,
                            NotificationPriority.MEDIUM,
                            RelatedEntityType.LEAD,
                            lead.getId(),
                            "/leads/" + lead.getId()
                    );
                }
            }
        }
        
        if (data.containsKey("assignedToId")) {
            Object idObj = data.get("assignedToId");
            Long newId = idObj != null ? ((Number) idObj).longValue() : null;
            Long oldId = lead.getAssignedTo() != null ? lead.getAssignedTo().getId() : null;
            if ((oldId == null && newId != null) || (oldId != null && !oldId.equals(newId))) {
                User newUser = newId != null ? userRepository.findById(newId).orElse(null) : null;
                lead.setAssignedTo(newUser);
                String oldName = oldId != null ? userRepository.findById(oldId).map(User::getFullName).orElse("Unassigned") : "Unassigned";
                String newName = newUser != null ? newUser.getFullName() : "Unassigned";
                changes.append("Owner updated from ").append(oldName).append(" to ").append(newName).append(". ");

                if (newUser != null) {
                    User currentUser = userDetailsService.getCurrentUserEntity();
                    if (!newUser.getId().equals(currentUser.getId())) {
                        notificationService.createNotification(
                                newUser,
                                "Lead Reassigned",
                                "Lead " + lead.getFullName() + " was assigned to you.",
                                NotificationType.NEW_LEAD_ASSIGNED,
                                NotificationPriority.HIGH,
                                RelatedEntityType.LEAD,
                                lead.getId(),
                                "/leads/" + lead.getId()
                        );
                    }
                }
            }
        }

        if (data.containsKey("followUpDate")) {
            Object followUpObj = data.get("followUpDate");
            if (followUpObj != null && !((String) followUpObj).isBlank()) {
                String rawDate = (String) followUpObj;
                try {
                    // Handle both "2026-06-25T10:00" and "2026-06-25T10:00:00" formats
                    java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm[:ss]");
                    lead.setFollowUpDate(java.time.LocalDateTime.parse(rawDate, fmt));
                } catch (Exception ex) {
                    // Ignore unparseable dates gracefully
                    lead.setFollowUpDate(null);
                }
            } else {
                lead.setFollowUpDate(null);
            }
            changes.append("Follow-up date updated. ");
        }

        if (data.containsKey("priority")) {
            LeadPriority newPriority = LeadPriority.valueOf((String) data.get("priority"));
            if (lead.getPriority() != newPriority) {
                changes.append("Priority updated from ").append(lead.getPriority()).append(" to ").append(newPriority).append(". ");
                lead.setPriority(newPriority);
                
                if (lead.getAssignedTo() != null) {
                    notificationService.createNotification(
                            lead.getAssignedTo(),
                            "Lead Priority Changed",
                            "Lead " + lead.getFullName() + " priority changed to " + newPriority,
                            NotificationType.SYSTEM_ALERT,
                            NotificationPriority.MEDIUM,
                            RelatedEntityType.LEAD,
                            lead.getId(),
                            "/leads/" + lead.getId()
                    );
                }
            }
        }

        Lead savedLead = leadRepository.save(lead);
        if (changes.length() > 0) {
            activityService.log("LEAD", savedLead.getId(), ActivityType.UPDATED, "Lead updated", changes.toString().trim());
        }
        return LeadResponse.from(savedLead);
    }

    private void autoTrackChange(Map<String, Object> data, String key, String oldValue, java.util.function.Consumer<Object> setter, StringBuilder changes, String fieldName) {
        if (data.containsKey(key)) {
            String newValue = (String) data.get(key);
            if ((oldValue == null && newValue != null) || (oldValue != null && !oldValue.equals(newValue))) {
                setter.accept(newValue);
                changes.append(fieldName).append(" updated from '").append(oldValue == null ? "" : oldValue).append("' to '").append(newValue == null ? "" : newValue).append("'. ");
            }
        }
    }

    @Transactional
    public void delete(Long id) {
        Lead lead = findLead(id);
        // Nullify all FK references pointing to this lead before deleting
        // to avoid foreign key constraint violations
        clientRepository.findByLeadId(id).ifPresent(client -> {
            client.setLead(null);
            clientRepository.save(client);
        });
        dealRepository.findByLeadId(id).forEach(deal -> {
            deal.setLead(null);
            dealRepository.save(deal);
        });
        taskRepository.findByLeadId(id).forEach(task -> {
            task.setLead(null);
            taskRepository.save(task);
        });
        leadRepository.delete(lead);
        activityService.log("LEAD", id, ActivityType.DELETED, "Lead deleted", lead.getFullName());
        
        if (lead.getAssignedTo() != null) {
            notificationService.createNotification(
                    lead.getAssignedTo(),
                    "Lead Deleted",
                    "Lead " + lead.getFullName() + " has been permanently deleted.",
                    NotificationType.SYSTEM_ALERT,
                    NotificationPriority.HIGH,
                    RelatedEntityType.LEAD,
                    lead.getId(),
                    null
            );
        }
    }

    @Transactional
    public LeadResponse convert(Long id, Map<String, Object> data) {
        Lead lead = findLead(id);
        if (lead.getStatus() == LeadStatus.WON) {
            throw new RuntimeException("Lead is already converted");
        }
        User currentUser = userDetailsService.getCurrentUserEntity();
        
        lead.setStatus(LeadStatus.WON);
        lead.setConversionDate(java.time.LocalDateTime.now());
        lead.setConvertedBy(currentUser);
        lead = leadRepository.save(lead);
        
        clientService.convertFromLead(id);
        
        activityService.log("LEAD", lead.getId(), ActivityType.CONVERTED, "Lead converted", lead.getFullName());
        
        if (lead.getAssignedTo() != null) {
            notificationService.createNotification(
                    lead.getAssignedTo(),
                    "Lead Converted",
                    "Lead " + lead.getFullName() + " was successfully converted to a client.",
                    NotificationType.SYSTEM_ALERT,
                    NotificationPriority.HIGH,
                    RelatedEntityType.LEAD,
                    lead.getId(),
                    "/clients"
            );
        }
        
        return LeadResponse.from(lead);
    }

    @Transactional
    public LeadResponse markLost(Long id, Map<String, Object> data) {
        Lead lead = findLead(id);
        User currentUser = userDetailsService.getCurrentUserEntity();

        lead.setStatus(LeadStatus.LOST);
        lead.setLossReason((String) data.get("reason"));
        if (data.containsKey("notes")) {
            lead.setNotes(lead.getNotes() != null ? lead.getNotes() + "\n" + data.get("notes") : (String) data.get("notes"));
        }
        
        lead.setIsDeleted(true);
        lead.setDeletedAt(java.time.LocalDateTime.now());
        lead.setDeletedBy(currentUser);
        
        lead = leadRepository.save(lead);
        activityService.log("LEAD", lead.getId(), ActivityType.LOST, "Lead lost", "Reason: " + lead.getLossReason());
        return LeadResponse.from(lead);
    }

    @Transactional
    public LeadResponse restore(Long id) {
        Lead lead = findLead(id);
        lead.setIsDeleted(false);
        lead.setDeletedAt(null);
        lead.setDeletedBy(null);
        lead.setStatus(LeadStatus.NEW);
        lead = leadRepository.save(lead);
        activityService.log("LEAD", lead.getId(), ActivityType.RESTORED, "Lead restored", lead.getFullName());
        return LeadResponse.from(lead);
    }

    public List<LeadResponse> getTrash() {
        Specification<Lead> spec = (root, query, cb) -> cb.isTrue(root.get("isDeleted"));
        return leadRepository.findAll(spec).stream().map(LeadResponse::from).collect(Collectors.toList());
    }

    private Lead findLead(Long id) {
        return leadRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
    }
}

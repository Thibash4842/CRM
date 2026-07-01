package com.scratchio.crm.dto.response;

import com.scratchio.crm.entity.*;
import com.scratchio.crm.entity.enums.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class EntityMappers {

    @Data @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private Role role;
        private String avatarUrl;
        private Boolean isActive;
        private LocalDateTime createdAt;

        public static UserResponse from(User u) {
            if (u == null) return null;
            return UserResponse.builder()
                    .id(u.getId()).email(u.getEmail())
                    .firstName(u.getFirstName()).lastName(u.getLastName())
                    .phone(u.getPhone()).role(u.getRole())
                    .avatarUrl(u.getAvatarUrl()).isActive(u.getIsActive())
                    .createdAt(u.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class LeadResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String company;
        private String jobTitle;
        private String source;
        private LeadStatus status;
        private String notes;
        private Long assignedToId;
        private String assignedToName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime conversionDate;
        private Long convertedById;
        private String convertedByName;
        private String lossReason;
        private LocalDateTime deletedAt;
        private Long deletedById;
        private String deletedByName;
        private Boolean isDeleted;
        private LocalDateTime followUpDate;
        private LeadPriority priority;

        public static LeadResponse from(Lead l) {
            if (l == null) return null;
            return LeadResponse.builder()
                    .id(l.getId()).firstName(l.getFirstName()).lastName(l.getLastName())
                    .fullName(l.getFullName()).email(l.getEmail()).phone(l.getPhone())
                    .company(l.getCompany()).jobTitle(l.getJobTitle()).source(l.getSource())
                    .status(l.getStatus()).notes(l.getNotes())
                    .assignedToId(l.getAssignedTo() != null ? l.getAssignedTo().getId() : null)
                    .assignedToName(l.getAssignedTo() != null ? l.getAssignedTo().getFullName() : null)
                    .createdAt(l.getCreatedAt()).updatedAt(l.getUpdatedAt())
                    .conversionDate(l.getConversionDate())
                    .convertedById(l.getConvertedBy() != null ? l.getConvertedBy().getId() : null)
                    .convertedByName(l.getConvertedBy() != null ? l.getConvertedBy().getFullName() : null)
                    .lossReason(l.getLossReason())
                    .deletedAt(l.getDeletedAt())
                    .deletedById(l.getDeletedBy() != null ? l.getDeletedBy().getId() : null)
                    .deletedByName(l.getDeletedBy() != null ? l.getDeletedBy().getFullName() : null)
                    .isDeleted(l.getIsDeleted())
                    .followUpDate(l.getFollowUpDate())
                    .priority(l.getPriority())
                    .build();
        }
    }

    @Data @Builder
    public static class ClientResponse {
        private Long id;
        private Long leadId;
        private String companyName;
        private String contactName;
        private String email;
        private String phone;
        private String website;
        private String industry;
        private String address;
        private String city;
        private String state;
        private String country;
        private String postalCode;
        private String notes;
        private Long assignedToId;
        private String assignedToName;
        private LocalDateTime createdAt;

        public static ClientResponse from(Client c) {
            if (c == null) return null;
            return ClientResponse.builder()
                    .id(c.getId()).leadId(c.getLead() != null ? c.getLead().getId() : null)
                    .companyName(c.getCompanyName()).contactName(c.getContactName())
                    .email(c.getEmail()).phone(c.getPhone()).website(c.getWebsite())
                    .industry(c.getIndustry()).address(c.getAddress())
                    .city(c.getCity()).state(c.getState()).country(c.getCountry())
                    .postalCode(c.getPostalCode()).notes(c.getNotes())
                    .assignedToId(c.getAssignedTo() != null ? c.getAssignedTo().getId() : null)
                    .assignedToName(c.getAssignedTo() != null ? c.getAssignedTo().getFullName() : null)
                    .createdAt(c.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class AccountResponse {
        private Long id;
        private String name;
        private String industry;
        private String website;
        private String phone;
        private String billingAddress;
        private Long leadId;
        private Long ownerId;
        private String ownerName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static AccountResponse from(Account a) {
            if (a == null) return null;
            return AccountResponse.builder()
                    .id(a.getId()).name(a.getName()).industry(a.getIndustry())
                    .website(a.getWebsite()).phone(a.getPhone())
                    .billingAddress(a.getBillingAddress())
                    .leadId(a.getLead() != null ? a.getLead().getId() : null)
                    .ownerId(a.getOwner() != null ? a.getOwner().getId() : null)
                    .ownerName(a.getOwner() != null ? a.getOwner().getFullName() : null)
                    .createdAt(a.getCreatedAt())
                    .updatedAt(a.getUpdatedAt()).build();
        }
    }

    @Data @Builder
    public static class ContactResponse {
        private Long id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String title;
        private Long accountId;
        private String accountName;
        private Long leadId;
        private Long ownerId;
        private String ownerName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static ContactResponse from(Contact c) {
            if (c == null) return null;
            return ContactResponse.builder()
                    .id(c.getId()).firstName(c.getFirstName()).lastName(c.getLastName())
                    .fullName(c.getFirstName() + " " + c.getLastName())
                    .email(c.getEmail()).phone(c.getPhone()).title(c.getTitle())
                    .accountId(c.getAccount() != null ? c.getAccount().getId() : null)
                    .accountName(c.getAccount() != null ? c.getAccount().getName() : null)
                    .leadId(c.getLead() != null ? c.getLead().getId() : null)
                    .ownerId(c.getOwner() != null ? c.getOwner().getId() : null)
                    .ownerName(c.getOwner() != null ? c.getOwner().getFullName() : null)
                    .createdAt(c.getCreatedAt())
                    .updatedAt(c.getUpdatedAt()).build();
        }
    }

    @Data @Builder
    public static class DealResponse {
        private Long id;
        private String title;
        private String description;
        private BigDecimal value;
        private DealStage stage;
        private LocalDate expectedCloseDate;
        private Long leadId;
        private Long clientId;
        private String clientName;
        private Long assignedToId;
        private String assignedToName;
        private LocalDateTime createdAt;

        public static DealResponse from(Deal d) {
            if (d == null) return null;
            return DealResponse.builder()
                    .id(d.getId()).title(d.getTitle()).description(d.getDescription())
                    .value(d.getValue()).stage(d.getStage())
                    .expectedCloseDate(d.getExpectedCloseDate())
                    .leadId(d.getLead() != null ? d.getLead().getId() : null)
                    .clientId(d.getClient() != null ? d.getClient().getId() : null)
                    .clientName(d.getClient() != null ? d.getClient().getCompanyName() : null)
                    .assignedToId(d.getAssignedTo() != null ? d.getAssignedTo().getId() : null)
                    .assignedToName(d.getAssignedTo() != null ? d.getAssignedTo().getFullName() : null)
                    .createdAt(d.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class TaskResponse {
        private Long id;
        private String title;
        private String description;
        private LocalDateTime dueDate;
        private TaskPriority priority;
        private TaskStatus status;
        private LocalDateTime reminderAt;
        private Long assignedToId;
        private String assignedToName;
        private Long leadId;
        private Long dealId;
        private Long clientId;
        private Long projectId;
        private LocalDateTime createdAt;

        public static TaskResponse from(Task t) {
            if (t == null) return null;
            return TaskResponse.builder()
                    .id(t.getId()).title(t.getTitle()).description(t.getDescription())
                    .dueDate(t.getDueDate()).priority(t.getPriority()).status(t.getStatus())
                    .reminderAt(t.getReminderAt())
                    .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                    .assignedToName(t.getAssignedTo() != null ? t.getAssignedTo().getFullName() : null)
                    .leadId(t.getLead() != null ? t.getLead().getId() : null)
                    .dealId(t.getDeal() != null ? t.getDeal().getId() : null)
                    .clientId(t.getClient() != null ? t.getClient().getId() : null)
                    .projectId(t.getProject() != null ? t.getProject().getId() : null)
                    .createdAt(t.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class ProjectResponse {
        private Long id;
        private String name;
        private String description;
        private ProjectStatus status;
        private Integer progress;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long clientId;
        private String clientName;
        private Long dealId;
        private Long managerId;
        private String managerName;
        private java.util.List<Long> teamMemberIds;
        private java.util.List<String> teamMemberNames;
        private LocalDateTime createdAt;

        @SuppressWarnings("null")
        public static ProjectResponse from(Project p) {
            if (p == null) return null;
            return ProjectResponse.builder()
                    .id(p.getId()).name(p.getName()).description(p.getDescription())
                    .status(p.getStatus()).progress(p.getProgress())
                    .startDate(p.getStartDate()).endDate(p.getEndDate())
                    .clientId(p.getClient() != null ? p.getClient().getId() : null)
                    .clientName(p.getClient() != null ? p.getClient().getCompanyName() : null)
                    .dealId(p.getDeal() != null ? p.getDeal().getId() : null)
                    .managerId(p.getManager() != null ? p.getManager().getId() : null)
                    .managerName(p.getManager() != null ? p.getManager().getFullName() : null)
                    .teamMemberIds(p.getTeamMembers().stream().map(User::getId).toList())
                    .teamMemberNames(p.getTeamMembers().stream().map(User::getFullName).toList())
                    .createdAt(p.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class InvoiceResponse {
        private Long id;
        private String invoiceNumber;
        private Long clientId;
        private String clientName;
        private Long projectId;
        private BigDecimal amount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private LocalDate dueDate;
        private InvoiceStatus status;
        private String notes;
        private BigDecimal paidAmount;
        private BigDecimal outstandingAmount;
        private LocalDateTime createdAt;

        public static InvoiceResponse from(Invoice i, BigDecimal paid) {
            if (i == null) return null;
            BigDecimal paidAmt = paid != null ? paid : BigDecimal.ZERO;
            return InvoiceResponse.builder()
                    .id(i.getId()).invoiceNumber(i.getInvoiceNumber())
                    .clientId(i.getClient().getId()).clientName(i.getClient().getCompanyName())
                    .projectId(i.getProject() != null ? i.getProject().getId() : null)
                    .amount(i.getAmount()).taxAmount(i.getTaxAmount()).totalAmount(i.getTotalAmount())
                    .dueDate(i.getDueDate()).status(i.getStatus()).notes(i.getNotes())
                    .paidAmount(paidAmt).outstandingAmount(i.getTotalAmount().subtract(paidAmt))
                    .createdAt(i.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class PaymentResponse {
        private Long id;
        private Long invoiceId;
        private String invoiceNumber;
        private BigDecimal amount;
        private LocalDate paymentDate;
        private String paymentMethod;
        private String reference;
        private String notes;
        private LocalDateTime createdAt;

        public static PaymentResponse from(Payment p) {
            if (p == null) return null;
            return PaymentResponse.builder()
                    .id(p.getId()).invoiceId(p.getInvoice().getId())
                    .invoiceNumber(p.getInvoice().getInvoiceNumber())
                    .amount(p.getAmount()).paymentDate(p.getPaymentDate())
                    .paymentMethod(p.getPaymentMethod()).reference(p.getReference())
                    .notes(p.getNotes()).createdAt(p.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class ActivityResponse {
        private Long id;
        private ActivityType type;
        private String title;
        private String description;
        private String entityType;
        private Long entityId;
        private String userName;
        private LocalDateTime createdAt;

        public static ActivityResponse from(Activity a) {
            if (a == null) return null;
            return ActivityResponse.builder()
                    .id(a.getId()).type(a.getType()).title(a.getTitle())
                    .description(a.getDescription()).entityType(a.getEntityType())
                    .entityId(a.getEntityId())
                    .userName(a.getUser() != null ? a.getUser().getFullName() : "System")
                    .createdAt(a.getCreatedAt()).build();
        }
    }

    @Data @Builder
    public static class NotificationResponse {
        private Long id;
        private Long recipientId;
        private String title;
        private String message;
        private NotificationType notificationType;
        private NotificationPriority priority;
        private RelatedEntityType relatedEntityType;
        private Long relatedEntityId;
        private String actionUrl;
        private Boolean isRead;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Long createdById;

        public static NotificationResponse from(Notification n) {
            if (n == null) return null;
            return NotificationResponse.builder()
                    .id(n.getId())
                    .recipientId(n.getRecipientUser() != null ? n.getRecipientUser().getId() : null)
                    .title(n.getTitle())
                    .message(n.getMessage())
                    .notificationType(n.getNotificationType())
                    .priority(n.getPriority())
                    .relatedEntityType(n.getRelatedEntityType())
                    .relatedEntityId(n.getRelatedEntityId())
                    .actionUrl(n.getActionUrl())
                    .isRead(n.getIsRead())
                    .createdAt(n.getCreatedAt())
                    .updatedAt(n.getUpdatedAt())
                    .createdById(n.getCreatedBy() != null ? n.getCreatedBy().getId() : null)
                    .build();
        }
    }

    @Data @Builder
    public static class CalendarEventResponse {
        private Long id;
        private String title;
        private String description;
        private EventType eventType;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private boolean isAllDay;
        private Long ownerId;
        private String ownerName;
        private String location;
        private String meetingUrl;
        private EventStatus status;
        private Long contactId;
        private String contactName;
        private Long dealId;
        private String dealTitle;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CalendarEventResponse from(CalendarEvent e) {
            if (e == null) return null;
            return CalendarEventResponse.builder()
                    .id(e.getId()).title(e.getTitle()).description(e.getDescription())
                    .eventType(e.getEventType()).startTime(e.getStartTime())
                    .endTime(e.getEndTime()).isAllDay(e.isAllDay())
                    .ownerId(e.getOwner() != null ? e.getOwner().getId() : null)
                    .ownerName(e.getOwner() != null ? e.getOwner().getFullName() : null)
                    .location(e.getLocation()).meetingUrl(e.getMeetingUrl())
                    .status(e.getStatus())
                    .contactId(e.getContact() != null ? e.getContact().getId() : null)
                    .contactName(e.getContact() != null ? e.getContact().getFullName() : null)
                    .dealId(e.getDeal() != null ? e.getDeal().getId() : null)
                    .dealTitle(e.getDeal() != null ? e.getDeal().getTitle() : null)
                    .createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt())
                    .build();
        }
    }
}

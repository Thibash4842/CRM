package com.scratchio.crm.config;

import com.scratchio.crm.entity.*;
import com.scratchio.crm.entity.enums.*;
import com.scratchio.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final DealRepository dealRepository;
    private final ProjectRepository projectRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaskRepository taskRepository;
    private final ActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        User admin = userRepository.save(User.builder()
                .email("admin@scratchio.com")
                .password(passwordEncoder.encode("Admin@123"))
                .firstName("Admin").lastName("User")
                .role(Role.ADMIN).isActive(true).build());

        User manager = userRepository.save(User.builder()
                .email("manager@scratchio.com")
                .password(passwordEncoder.encode("Manager@123"))
                .firstName("Sarah").lastName("Manager")
                .role(Role.MANAGER).isActive(true).build());

        User sales = userRepository.save(User.builder()
                .email("sales@scratchio.com")
                .password(passwordEncoder.encode("Sales@123"))
                .firstName("John").lastName("Sales")
                .role(Role.SALES_EXECUTIVE).isActive(true).build());

        Lead lead1 = leadRepository.save(Lead.builder()
                .firstName("Michael").lastName("Chen")
                .email("michael@techcorp.com").phone("+1-555-0101")
                .company("TechCorp Inc").source("Website").status(LeadStatus.CONTACTED)
                .assignedTo(sales).createdBy(admin).build());

        Lead lead2 = leadRepository.save(Lead.builder()
                .firstName("Emily").lastName("Rodriguez")
                .email("emily@innovate.io").phone("+1-555-0102")
                .company("Innovate.io").source("Referral").status(LeadStatus.MEETING)
                .assignedTo(sales).createdBy(admin).build());

        leadRepository.save(Lead.builder()
                .firstName("David").lastName("Kim")
                .email("david@startup.co").company("StartupCo").source("LinkedIn")
                .status(LeadStatus.NEW).assignedTo(sales).createdBy(admin).build());

        Client client = clientRepository.save(Client.builder()
                .lead(lead1).companyName("TechCorp Inc").contactName("Michael Chen")
                .email("michael@techcorp.com").phone("+1-555-0101")
                .industry("Technology").assignedTo(sales).createdBy(admin).build());

        Deal deal1 = dealRepository.save(Deal.builder()
                .title("TechCorp Enterprise License")
                .value(new BigDecimal("45000")).stage(DealStage.NEGOTIATION)
                .expectedCloseDate(LocalDate.now().plusDays(14))
                .client(client).lead(lead1).assignedTo(sales).createdBy(admin).build());

        dealRepository.save(Deal.builder()
                .title("Innovate.io Platform Deal")
                .value(new BigDecimal("28000")).stage(DealStage.PROPOSAL)
                .expectedCloseDate(LocalDate.now().plusDays(30))
                .lead(lead2).assignedTo(sales).createdBy(admin).build());

        dealRepository.save(Deal.builder()
                .title("Global Systems Integration")
                .value(new BigDecimal("120000")).stage(DealStage.QUALIFICATION)
                .expectedCloseDate(LocalDate.now().plusDays(60))
                .assignedTo(manager).createdBy(admin).build());

        Project project = projectRepository.save(Project.builder()
                .name("TechCorp CRM Implementation")
                .description("Full CRM rollout for TechCorp")
                .status(ProjectStatus.IN_PROGRESS).progress(65)
                .startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now().plusDays(60))
                .client(client).deal(deal1).manager(manager).createdBy(admin).build());

        Invoice invoice = invoiceRepository.save(Invoice.builder()
                .invoiceNumber("INV-2024-001")
                .client(client).project(project)
                .amount(new BigDecimal("22500")).taxAmount(new BigDecimal("2250"))
                .totalAmount(new BigDecimal("24750"))
                .dueDate(LocalDate.now().plusDays(15))
                .status(InvoiceStatus.SENT).createdBy(admin).build());

        taskRepository.save(Task.builder()
                .title("Follow up with TechCorp")
                .description("Schedule demo call for enterprise features")
                .dueDate(LocalDateTime.now().plusDays(2))
                .priority(TaskPriority.HIGH).status(TaskStatus.PENDING)
                .assignedTo(sales).deal(deal1).createdBy(admin).build());

        taskRepository.save(Task.builder()
                .title("Prepare proposal for Innovate.io")
                .dueDate(LocalDateTime.now().plusDays(5))
                .priority(TaskPriority.MEDIUM).status(TaskStatus.IN_PROGRESS)
                .assignedTo(sales).createdBy(admin).build());

        activityRepository.save(Activity.builder()
                .type(ActivityType.CREATED).title("New lead added")
                .description("Michael Chen from TechCorp Inc")
                .entityType("LEAD").entityId(lead1.getId()).user(admin).build());

        activityRepository.save(Activity.builder()
                .type(ActivityType.CONVERTED).title("Lead converted to client")
                .description("TechCorp Inc is now a client")
                .entityType("CLIENT").entityId(client.getId()).user(sales).build());

        activityRepository.save(Activity.builder()
                .type(ActivityType.STATUS_CHANGED).title("Deal moved to Negotiation")
                .description("TechCorp Enterprise License")
                .entityType("DEAL").entityId(deal1.getId()).user(sales).build());
    }
}

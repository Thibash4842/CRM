package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.InvoiceResponse;
import com.scratchio.crm.entity.Invoice;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.InvoiceStatus;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.ClientRepository;
import com.scratchio.crm.repository.InvoiceRepository;
import com.scratchio.crm.repository.PaymentRepository;
import com.scratchio.crm.repository.ProjectRepository;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ActivityService activityService;
    private final AuditLogService auditLogService;
    private final CustomUserDetailsService userDetailsService;

    public List<InvoiceResponse> getAll(InvoiceStatus status) {
        List<Invoice> invoices = status != null ? invoiceRepository.findByStatus(status) : invoiceRepository.findAll();
        return invoices.stream()
                .map(i -> InvoiceResponse.from(i, paymentRepository.sumByInvoiceId(i.getId())))
                .collect(Collectors.toList());
    }

    public InvoiceResponse getById(Long id) {
        Invoice invoice = findInvoice(id);
        return InvoiceResponse.from(invoice, paymentRepository.sumByInvoiceId(id));
    }

    @Transactional
    public InvoiceResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        BigDecimal amount = new BigDecimal(data.get("amount").toString());
        BigDecimal tax = data.get("taxAmount") != null ? new BigDecimal(data.get("taxAmount").toString()) : BigDecimal.ZERO;

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .client(clientRepository.findById(((Number) data.get("clientId")).longValue())
                        .orElseThrow(() -> new ResourceNotFoundException("Client not found")))
                .amount(amount)
                .taxAmount(tax)
                .totalAmount(amount.add(tax))
                .balanceDue(amount.add(tax))
                .dueDate(LocalDate.parse((String) data.get("dueDate")))
                .status(InvoiceStatus.DRAFT)
                .notes((String) data.get("notes"))
                .createdBy(currentUser)
                .build();

        if (data.get("projectId") != null) {
            invoice.setProject(projectRepository.findById(((Number) data.get("projectId")).longValue()).orElse(null));
        }

        invoice = invoiceRepository.save(invoice);
        activityService.log("INVOICE", invoice.getId(), ActivityType.CREATED,
                "Invoice created", invoice.getInvoiceNumber());
        auditLogService.log("Generated Invoice", "Invoices", "Invoice " + invoice.getInvoiceNumber() + " generated for " + invoice.getClient().getCompanyName(), currentUser);
        return InvoiceResponse.from(invoice, BigDecimal.ZERO);
    }

    @Transactional
    public InvoiceResponse updateStatus(Long id, InvoiceStatus status) {
        Invoice invoice = findInvoice(id);
        invoice.setStatus(status);
        invoice = invoiceRepository.save(invoice);
        
        User currentUser = userDetailsService.getCurrentUserEntity();
        auditLogService.log("Updated Invoice", "Invoices", "Invoice ID " + id + " status changed to " + status, currentUser);
        return InvoiceResponse.from(invoice, paymentRepository.sumByInvoiceId(id));
    }

    @Transactional
    public void delete(Long id) {
        Invoice invoice = findInvoice(id);
        User currentUser = userDetailsService.getCurrentUserEntity();
        auditLogService.log("Deleted Invoice", "Invoices", "Invoice " + invoice.getInvoiceNumber() + " deleted", currentUser);
        invoiceRepository.delete(invoice);
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis();
    }

    private Invoice findInvoice(Long id) {
        return invoiceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
    }
}

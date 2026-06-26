package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.PaymentResponse;
import com.scratchio.crm.entity.Invoice;
import com.scratchio.crm.entity.Payment;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.InvoiceStatus;
import com.scratchio.crm.exception.BadRequestException;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.InvoiceRepository;
import com.scratchio.crm.repository.PaymentRepository;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;

    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll().stream().map(PaymentResponse::from).collect(Collectors.toList());
    }

    public List<PaymentResponse> getByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream().map(PaymentResponse::from).collect(Collectors.toList());
    }

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalRevenue", invoiceRepository.sumPaidInvoices());
        summary.put("outstandingAmount", invoiceRepository.sumOutstandingInvoices());
        summary.put("recentPayments", paymentRepository.findRecentPayments().stream()
                .limit(10).map(PaymentResponse::from).collect(Collectors.toList()));
        return summary;
    }

    @Transactional
    public PaymentResponse recordPayment(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Long invoiceId = ((Number) data.get("invoiceId")).longValue();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        BigDecimal amount = new BigDecimal(data.get("amount").toString());
        BigDecimal alreadyPaid = paymentRepository.sumByInvoiceId(invoiceId);
        if (alreadyPaid.add(amount).compareTo(invoice.getTotalAmount()) > 0) {
            throw new BadRequestException("Payment exceeds invoice total");
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(amount)
                .paymentDate(LocalDate.parse((String) data.get("paymentDate")))
                .paymentMethod((String) data.get("paymentMethod"))
                .reference((String) data.get("reference"))
                .notes((String) data.get("notes"))
                .createdBy(currentUser)
                .build();

        payment = paymentRepository.save(payment);

        BigDecimal totalPaid = paymentRepository.sumByInvoiceId(invoiceId);
        if (totalPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        }
        invoiceRepository.save(invoice);

        activityService.log("PAYMENT", payment.getId(), ActivityType.PAYMENT_RECEIVED,
                "Payment received", "$" + amount + " for " + invoice.getInvoiceNumber());

        return PaymentResponse.from(payment);
    }
}

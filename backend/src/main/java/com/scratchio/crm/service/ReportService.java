package com.scratchio.crm.service;

import com.scratchio.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final DealRepository dealRepository;
    private final LeadRepository leadRepository;
    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;

    public Map<String, Object> revenueReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", invoiceRepository.sumPaidInvoices());
        report.put("outstanding", invoiceRepository.sumOutstandingInvoices());
        report.put("monthlyBreakdown", invoiceRepository.monthlyRevenue());
        return report;
    }

    public Map<String, Object> salesReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("dealsByStage", dealRepository.countByStage());
        report.put("totalWonValue", dealRepository.sumWonDealValue());
        return report;
    }

    public Map<String, Object> leadReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalLeads", leadRepository.count());
        report.put("bySource", leadRepository.countBySource().stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1])));
        long won = leadRepository.countByStatus(com.scratchio.crm.entity.enums.LeadStatus.WON);
        long total = leadRepository.count();
        report.put("conversionRate", total > 0
                ? BigDecimal.valueOf(won * 100.0 / total).setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        return report;
    }

    public Map<String, Object> conversionReport() {
        return leadReport();
    }

    public Map<String, Object> projectReport() {
        Map<String, Object> report = new HashMap<>();
        report.put("totalProjects", projectRepository.count());
        report.put("byStatus", projectRepository.countByStatus().stream()
                .collect(Collectors.toMap(r -> r[0].toString(), r -> (Long) r[1])));
        return report;
    }
}

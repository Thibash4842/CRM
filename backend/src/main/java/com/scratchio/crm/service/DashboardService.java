package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.DashboardResponse;
import com.scratchio.crm.dto.response.MonthlySalesData;
import com.scratchio.crm.dto.response.EntityMappers.ActivityResponse;
import com.scratchio.crm.dto.response.EntityMappers.TaskResponse;
import com.scratchio.crm.entity.enums.DealStage;
import com.scratchio.crm.entity.enums.LeadStatus;
import com.scratchio.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeadRepository leadRepository;
    private final DealRepository dealRepository;
    private final ClientRepository clientRepository;
    private final InvoiceRepository invoiceRepository;
    private final ActivityRepository activityRepository;
    private final TaskRepository taskRepository;

    public DashboardResponse getDashboard() {
        long totalLeads = leadRepository.count();
        long activeDeals = dealRepository.countByStageNot(DealStage.LOST);
        long totalClients = clientRepository.count();
        BigDecimal revenue = invoiceRepository.sumPaidInvoices();
        BigDecimal outstanding = invoiceRepository.sumOutstandingInvoices();

        long wonLeads = leadRepository.countByStatus(LeadStatus.WON);
        double conversionRate = totalLeads > 0
                ? BigDecimal.valueOf(wonLeads * 100.0 / totalLeads).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        List<MonthlySalesData> monthlySales = invoiceRepository.monthlyRevenue().stream()
                .map(row -> {
                    int month = ((Number) row[0]).intValue();
                    int year = ((Number) row[1]).intValue();
                    BigDecimal amount = (BigDecimal) row[2];
                    return MonthlySalesData.builder()
                            .month(month).year(year).amount(amount)
                            .label(Month.of(month).name().substring(0, 3) + " " + year)
                            .build();
                }).collect(Collectors.toList());

        List<ActivityResponse> recentActivities = activityRepository.findTop20ByOrderByCreatedAtDesc()
                .stream().map(ActivityResponse::from).collect(Collectors.toList());

        List<TaskResponse> upcomingTasks = taskRepository.findUpcomingTasks(LocalDateTime.now())
                .stream().limit(10).map(TaskResponse::from).collect(Collectors.toList());

        Map<String, Long> dealsByStage = new LinkedHashMap<>();
        for (DealStage stage : DealStage.values()) {
            dealsByStage.put(stage.name(), (long) dealRepository.findByStage(stage).size());
        }

        return DashboardResponse.builder()
                .totalLeads(totalLeads)
                .activeDeals(activeDeals)
                .totalClients(totalClients)
                .revenue(revenue != null ? revenue : BigDecimal.ZERO)
                .outstandingAmount(outstanding != null ? outstanding : BigDecimal.ZERO)
                .conversionRate(conversionRate)
                .monthlySales(monthlySales)
                .recentActivities(recentActivities)
                .upcomingTasks(upcomingTasks)
                .dealsByStage(dealsByStage)
                .build();
    }
}

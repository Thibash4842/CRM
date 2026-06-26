package com.scratchio.crm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private long totalLeads;
    private long activeDeals;
    private long totalClients;
    private BigDecimal revenue;
    private BigDecimal outstandingAmount;
    private double conversionRate;
    private List<MonthlySalesData> monthlySales;

    private List<EntityMappers.ActivityResponse> recentActivities;
    private List<EntityMappers.TaskResponse> upcomingTasks;

    private Map<String, Long> dealsByStage;
}
package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.DealResponse;
import com.scratchio.crm.entity.*;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.DealStage;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.*;
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
public class DealService {

    private final DealRepository dealRepository;
    private final LeadRepository leadRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;

    public List<DealResponse> getAll() {
        return dealRepository.findAll().stream().map(DealResponse::from).collect(Collectors.toList());
    }

    public List<DealResponse> getByStage(DealStage stage) {
        return dealRepository.findByStage(stage).stream().map(DealResponse::from).collect(Collectors.toList());
    }

    public DealResponse getById(Long id) {
        return DealResponse.from(findDeal(id));
    }

    @Transactional
    public DealResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Deal deal = Deal.builder()
                .title((String) data.get("title"))
                .description((String) data.get("description"))
                .value(data.get("value") != null ? new BigDecimal(data.get("value").toString()) : BigDecimal.ZERO)
                .stage(data.get("stage") != null ? DealStage.valueOf((String) data.get("stage")) : DealStage.QUALIFICATION)
                .expectedCloseDate(data.get("expectedCloseDate") != null ? LocalDate.parse((String) data.get("expectedCloseDate")) : null)
                .createdBy(currentUser)
                .build();

        if (data.get("leadId") != null) {
            deal.setLead(leadRepository.findById(((Number) data.get("leadId")).longValue()).orElse(null));
        }
        if (data.get("clientId") != null) {
            deal.setClient(clientRepository.findById(((Number) data.get("clientId")).longValue()).orElse(null));
        }
        if (data.get("assignedToId") != null) {
            deal.setAssignedTo(userRepository.findById(((Number) data.get("assignedToId")).longValue()).orElse(null));
        }

        deal = dealRepository.save(deal);
        activityService.log("DEAL", deal.getId(), ActivityType.CREATED, "Deal created", deal.getTitle());
        return DealResponse.from(deal);
    }

    @Transactional
    public DealResponse update(Long id, Map<String, Object> data) {
        Deal deal = findDeal(id);

        if (data.containsKey("title")) deal.setTitle((String) data.get("title"));
        if (data.containsKey("description")) deal.setDescription((String) data.get("description"));
        if (data.containsKey("value")) deal.setValue(new BigDecimal(data.get("value").toString()));
        if (data.containsKey("expectedCloseDate")) {
            deal.setExpectedCloseDate(data.get("expectedCloseDate") != null
                    ? LocalDate.parse((String) data.get("expectedCloseDate")) : null);
        }
        if (data.containsKey("assignedToId") && data.get("assignedToId") != null) {
            deal.setAssignedTo(userRepository.findById(((Number) data.get("assignedToId")).longValue()).orElse(null));
        }

        deal = dealRepository.save(deal);
        activityService.log("DEAL", deal.getId(), ActivityType.UPDATED, "Deal updated", deal.getTitle());
        return DealResponse.from(deal);
    }

    @Transactional
    public DealResponse updateStage(Long id, DealStage stage) {
        Deal deal = findDeal(id);
        deal.setStage(stage);
        deal = dealRepository.save(deal);
        activityService.log("DEAL", deal.getId(), ActivityType.STATUS_CHANGED,
                "Deal stage changed to " + stage.name(), deal.getTitle());
        return DealResponse.from(deal);
    }

    @Transactional
    public void delete(Long id) {
        Deal deal = findDeal(id);
        dealRepository.delete(deal);
        activityService.log("DEAL", id, ActivityType.DELETED, "Deal deleted", deal.getTitle());
    }

    private Deal findDeal(Long id) {
        return dealRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Deal not found"));
    }
}

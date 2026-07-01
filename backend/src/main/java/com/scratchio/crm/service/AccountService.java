package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.AccountResponse;
import com.scratchio.crm.entity.Account;
import com.scratchio.crm.entity.Lead;
import com.scratchio.crm.repository.AccountRepository;
import com.scratchio.crm.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AccountService {
    
    private final AccountRepository accountRepository;
    private final LeadRepository leadRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> getByLeadId(Long leadId) {
        return accountRepository.findByLeadId(leadId).stream()
                .map(AccountResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AccountResponse create(Map<String, Object> data) {
        Account.AccountBuilder builder = Account.builder()
                .name((String) data.get("name"))
                .industry((String) data.get("industry"))
                .website((String) data.get("website"))
                .phone((String) data.get("phone"))
                .billingAddress((String) data.get("billingAddress"));

        if (data.containsKey("leadId") && data.get("leadId") != null) {
            Lead lead = leadRepository.findById(Long.valueOf(data.get("leadId").toString()))
                    .orElseThrow(() -> new RuntimeException("Lead not found"));
            builder.lead(lead);
        }

        Account account = accountRepository.save(builder.build());
        return AccountResponse.from(account);
    }
}

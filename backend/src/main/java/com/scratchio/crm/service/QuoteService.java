package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.QuoteResponse;
import com.scratchio.crm.entity.Quote;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.QuoteStatus;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.ClientRepository;
import com.scratchio.crm.repository.QuoteRepository;
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
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final ClientRepository clientRepository;
    private final ActivityService activityService;
    private final AuditLogService auditLogService;
    private final CustomUserDetailsService userDetailsService;

    public List<QuoteResponse> getAll(QuoteStatus status) {
        List<Quote> quotes = quoteRepository.findAll();
        if (status != null) {
            quotes = quotes.stream().filter(q -> q.getStatus() == status).collect(Collectors.toList());
        }
        return quotes.stream().map(QuoteResponse::from).collect(Collectors.toList());
    }

    public QuoteResponse getById(Long id) {
        return QuoteResponse.from(findQuote(id));
    }

    @Transactional
    public QuoteResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        
        Quote quote = Quote.builder()
                .quoteNumber(generateQuoteNumber())
                .client(clientRepository.findById(((Number) data.get("clientId")).longValue())
                        .orElseThrow(() -> new ResourceNotFoundException("Client not found")))
                .owner(currentUser)
                .amount(new BigDecimal(data.get("amount").toString()))
                .issueDate(LocalDate.parse((String) data.get("issueDate")))
                .expiryDate(LocalDate.parse((String) data.get("expiryDate")))
                .status(QuoteStatus.valueOf(data.getOrDefault("status", "DRAFT").toString()))
                .notes((String) data.get("notes"))
                .createdBy(currentUser)
                .build();

        quote = quoteRepository.save(quote);
        activityService.log("QUOTE", quote.getId(), ActivityType.CREATED, "Quote created", quote.getQuoteNumber());
        auditLogService.log("Created Quote", "Quotes", "Quote " + quote.getQuoteNumber() + " created for " + quote.getClient().getCompanyName(), currentUser);
        return QuoteResponse.from(quote);
    }

    @Transactional
    public QuoteResponse updateStatus(Long id, QuoteStatus status) {
        Quote quote = findQuote(id);
        quote.setStatus(status);
        quote = quoteRepository.save(quote);
        
        User currentUser = userDetailsService.getCurrentUserEntity();
        auditLogService.log("Updated Quote", "Quotes", "Quote ID " + id + " status changed to " + status, currentUser);
        return QuoteResponse.from(quote);
    }

    @Transactional
    public void delete(Long id) {
        Quote quote = findQuote(id);
        User currentUser = userDetailsService.getCurrentUserEntity();
        auditLogService.log("Deleted Quote", "Quotes", "Quote " + quote.getQuoteNumber() + " deleted", currentUser);
        quoteRepository.delete(quote);
    }

    private String generateQuoteNumber() {
        return "QT-" + System.currentTimeMillis();
    }

    private Quote findQuote(Long id) {
        return quoteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Quote not found"));
    }
}

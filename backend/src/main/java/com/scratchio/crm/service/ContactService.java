package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.ContactResponse;
import com.scratchio.crm.entity.Contact;
import com.scratchio.crm.entity.Lead;
import com.scratchio.crm.repository.ContactRepository;
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
public class ContactService {
    
    private final ContactRepository contactRepository;
    private final LeadRepository leadRepository;

    @Transactional(readOnly = true)
    public List<ContactResponse> getByLeadId(Long leadId) {
        return contactRepository.findByLeadId(leadId).stream()
                .map(ContactResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactResponse create(Map<String, Object> data) {
        Contact.ContactBuilder builder = Contact.builder()
                .firstName((String) data.get("firstName"))
                .lastName((String) data.get("lastName"))
                .email((String) data.get("email"))
                .phone((String) data.get("phone"))
                .title((String) data.get("title"));

        if (data.containsKey("leadId") && data.get("leadId") != null) {
            Lead lead = leadRepository.findById(Long.valueOf(data.get("leadId").toString()))
                    .orElseThrow(() -> new RuntimeException("Lead not found"));
            builder.lead(lead);
        }

        Contact contact = contactRepository.save(builder.build());
        return ContactResponse.from(contact);
    }
}

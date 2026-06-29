package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.ActivityResponse;
import com.scratchio.crm.dto.response.EntityMappers.ClientResponse;
import com.scratchio.crm.entity.Client;
import com.scratchio.crm.entity.Lead;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.LeadStatus;
import com.scratchio.crm.exception.BadRequestException;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.ActivityRepository;
import com.scratchio.crm.repository.ClientRepository;
import com.scratchio.crm.repository.LeadRepository;
import com.scratchio.crm.repository.UserRepository;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ClientService {

    private final ClientRepository clientRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;

    public List<ClientResponse> getAll(String search) {
        return clientRepository.findAll().stream()
                .filter(c -> search == null || search.isBlank()
                        || c.getCompanyName().toLowerCase().contains(search.toLowerCase())
                        || c.getContactName().toLowerCase().contains(search.toLowerCase()))
                .map(ClientResponse::from)
                .collect(Collectors.toList());
    }

    public ClientResponse getById(Long id) {
        return ClientResponse.from(findClient(id));
    }

    public List<ActivityResponse> getTimeline(Long id) {
        findClient(id);
        return activityRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("CLIENT", id)
                .stream().map(ActivityResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public ClientResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Client client = Client.builder()
                .companyName((String) data.get("companyName"))
                .contactName((String) data.get("contactName"))
                .email((String) data.get("email"))
                .phone((String) data.get("phone"))
                .website((String) data.get("website"))
                .industry((String) data.get("industry"))
                .address((String) data.get("address"))
                .city((String) data.get("city"))
                .state((String) data.get("state"))
                .country((String) data.get("country"))
                .postalCode((String) data.get("postalCode"))
                .notes((String) data.get("notes"))
                .createdBy(currentUser)
                .build();

        if (data.get("assignedToId") != null) {
            client.setAssignedTo(userRepository.findById(((Number) data.get("assignedToId")).longValue()).orElse(null));
        }

        client = clientRepository.save(client);
        activityService.log("CLIENT", client.getId(), ActivityType.CREATED, "Client created", client.getCompanyName());
        return ClientResponse.from(client);
    }

    @Transactional
    public ClientResponse convertFromLead(Long leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));

        if (clientRepository.findByLeadId(leadId).isPresent()) {
            throw new BadRequestException("Lead already converted to client");
        }

        User currentUser = userDetailsService.getCurrentUserEntity();
        Client client = Client.builder()
                .lead(lead)
                .companyName(lead.getCompany() != null ? lead.getCompany() : lead.getFullName())
                .contactName(lead.getFullName())
                .email(lead.getEmail())
                .phone(lead.getPhone())
                .notes(lead.getNotes())
                .assignedTo(lead.getAssignedTo())
                .createdBy(currentUser)
                .build();

        lead.setStatus(LeadStatus.WON);
        leadRepository.save(lead);

        client = clientRepository.save(client);
        activityService.log("CLIENT", client.getId(), ActivityType.CONVERTED,
                "Lead converted to client", lead.getFullName() + " → " + client.getCompanyName());
        return ClientResponse.from(client);
    }

    @Transactional
    public ClientResponse update(Long id, Map<String, Object> data) {
        Client client = findClient(id);

        if (data.containsKey("companyName")) client.setCompanyName((String) data.get("companyName"));
        if (data.containsKey("contactName")) client.setContactName((String) data.get("contactName"));
        if (data.containsKey("email")) client.setEmail((String) data.get("email"));
        if (data.containsKey("phone")) client.setPhone((String) data.get("phone"));
        if (data.containsKey("website")) client.setWebsite((String) data.get("website"));
        if (data.containsKey("industry")) client.setIndustry((String) data.get("industry"));
        if (data.containsKey("address")) client.setAddress((String) data.get("address"));
        if (data.containsKey("city")) client.setCity((String) data.get("city"));
        if (data.containsKey("state")) client.setState((String) data.get("state"));
        if (data.containsKey("country")) client.setCountry((String) data.get("country"));
        if (data.containsKey("postalCode")) client.setPostalCode((String) data.get("postalCode"));
        if (data.containsKey("notes")) client.setNotes((String) data.get("notes"));

        client = clientRepository.save(client);
        activityService.log("CLIENT", client.getId(), ActivityType.UPDATED, "Client updated", client.getCompanyName());
        return ClientResponse.from(client);
    }

    @Transactional
    public void delete(Long id) {
        Client client = findClient(id);
        clientRepository.delete(client);
    }

    private Client findClient(Long id) {
        return clientRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }
}

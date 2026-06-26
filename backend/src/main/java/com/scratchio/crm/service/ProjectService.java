package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.ProjectResponse;
import com.scratchio.crm.entity.Project;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.ActivityType;
import com.scratchio.crm.entity.enums.ProjectStatus;
import com.scratchio.crm.exception.ResourceNotFoundException;
import com.scratchio.crm.repository.*;
import com.scratchio.crm.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final DealRepository dealRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final CustomUserDetailsService userDetailsService;

    public List<ProjectResponse> getAll(ProjectStatus status) {
        List<Project> projects = status != null ? projectRepository.findByStatus(status) : projectRepository.findAll();
        return projects.stream().map(ProjectResponse::from).collect(Collectors.toList());
    }

    public ProjectResponse getById(Long id) {
        return ProjectResponse.from(findProject(id));
    }

    @Transactional
    public ProjectResponse create(Map<String, Object> data) {
        User currentUser = userDetailsService.getCurrentUserEntity();
        Project project = Project.builder()
                .name((String) data.get("name"))
                .description((String) data.get("description"))
                .status(data.get("status") != null ? ProjectStatus.valueOf((String) data.get("status")) : ProjectStatus.PLANNING)
                .progress(data.get("progress") != null ? ((Number) data.get("progress")).intValue() : 0)
                .startDate(data.get("startDate") != null ? LocalDate.parse((String) data.get("startDate")) : null)
                .endDate(data.get("endDate") != null ? LocalDate.parse((String) data.get("endDate")) : null)
                .createdBy(currentUser)
                .build();

        if (data.get("clientId") != null) {
            project.setClient(clientRepository.findById(((Number) data.get("clientId")).longValue()).orElse(null));
        }
        if (data.get("dealId") != null) {
            project.setDeal(dealRepository.findById(((Number) data.get("dealId")).longValue()).orElse(null));
        }
        if (data.get("managerId") != null) {
            project.setManager(userRepository.findById(((Number) data.get("managerId")).longValue()).orElse(null));
        }

        @SuppressWarnings("unchecked")
        List<Number> teamIds = (List<Number>) data.get("teamMemberIds");
        if (teamIds != null) {
            Set<User> members = teamIds.stream()
                    .map(id -> userRepository.findById(id.longValue()).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            project.setTeamMembers(members);
        }

        project = projectRepository.save(project);
        activityService.log("PROJECT", project.getId(), ActivityType.CREATED, "Project created", project.getName());
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse update(Long id, Map<String, Object> data) {
        Project project = findProject(id);

        if (data.containsKey("name")) project.setName((String) data.get("name"));
        if (data.containsKey("description")) project.setDescription((String) data.get("description"));
        if (data.containsKey("status")) project.setStatus(ProjectStatus.valueOf((String) data.get("status")));
        if (data.containsKey("progress")) project.setProgress(((Number) data.get("progress")).intValue());
        if (data.containsKey("startDate")) {
            project.setStartDate(data.get("startDate") != null ? LocalDate.parse((String) data.get("startDate")) : null);
        }
        if (data.containsKey("endDate")) {
            project.setEndDate(data.get("endDate") != null ? LocalDate.parse((String) data.get("endDate")) : null);
        }

        project = projectRepository.save(project);
        return ProjectResponse.from(project);
    }

    @Transactional
    public void delete(Long id) {
        projectRepository.delete(findProject(id));
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }
}

package com.scratchio.crm.service;

import com.scratchio.crm.dto.response.EntityMappers.AuditLogResponse;
import com.scratchio.crm.entity.AuditLog;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String module, String details, User user) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .module(module)
                .details(details)
                .user(user)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogResponse> getAll() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(AuditLogResponse::from)
                .collect(Collectors.toList());
    }
}

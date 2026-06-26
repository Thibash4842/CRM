package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {
    List<Client> findByAssignedToId(Long userId);
    Optional<Client> findByLeadId(Long leadId);
}

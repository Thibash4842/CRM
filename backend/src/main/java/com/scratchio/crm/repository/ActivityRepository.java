package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findTop20ByOrderByCreatedAtDesc();
    List<Activity> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, Long entityId);
}

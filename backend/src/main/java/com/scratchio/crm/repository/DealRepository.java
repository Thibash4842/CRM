package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Deal;
import com.scratchio.crm.entity.enums.DealStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DealRepository extends JpaRepository<Deal, Long> {
    List<Deal> findByLeadId(Long leadId);
    List<Deal> findByStage(DealStage stage);
    List<Deal> findByAssignedToId(Long userId);
    List<Deal> findByClientId(Long clientId);
    long countByStageNot(DealStage stage);

    @Query("SELECT COALESCE(SUM(d.value), 0) FROM Deal d WHERE d.stage = 'WON'")
    BigDecimal sumWonDealValue();

    @Query("SELECT d.stage, COUNT(d), COALESCE(SUM(d.value), 0) FROM Deal d GROUP BY d.stage")
    List<Object[]> countByStage();
}

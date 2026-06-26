package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Invoice;
import com.scratchio.crm.entity.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByClientId(Long clientId);
    List<Invoice> findByStatus(InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = 'PAID'")
    BigDecimal sumPaidInvoices();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status IN ('SENT', 'OVERDUE')")
    BigDecimal sumOutstandingInvoices();

    @Query("SELECT EXTRACT(MONTH FROM i.createdAt), EXTRACT(YEAR FROM i.createdAt), COALESCE(SUM(i.totalAmount), 0) " +
           "FROM Invoice i WHERE i.status = 'PAID' GROUP BY EXTRACT(MONTH FROM i.createdAt), EXTRACT(YEAR FROM i.createdAt) " +
           "ORDER BY EXTRACT(YEAR FROM i.createdAt), EXTRACT(MONTH FROM i.createdAt)")
    List<Object[]> monthlyRevenue();
}

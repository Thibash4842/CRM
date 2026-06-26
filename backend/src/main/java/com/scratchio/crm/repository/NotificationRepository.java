package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Notification;
import com.scratchio.crm.entity.enums.NotificationPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdAndIsArchivedOrderByCreatedAtDesc(Long recipientId, Boolean isArchived);

    long countByRecipientIdAndIsReadFalseAndIsArchivedFalse(Long recipientId);

    long countByRecipientIdAndIsArchivedFalse(Long recipientId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :recipientId AND n.isArchived = false AND n.createdAt >= :since")
    long countTodayNotifications(@Param("recipientId") Long recipientId, @Param("since") LocalDateTime since);

    long countByRecipientIdAndIsArchivedFalseAndPriority(Long recipientId, NotificationPriority priority);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.id = :recipientId AND n.isRead = false AND n.isArchived = false")
    void markAllReadForRecipient(@Param("recipientId") Long recipientId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.isArchived = true WHERE n.recipient.id = :recipientId AND n.isArchived = false")
    void archiveAllForRecipient(@Param("recipientId") Long recipientId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId")
    void deleteAllForRecipient(@Param("recipientId") Long recipientId);
}

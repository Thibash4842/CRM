package com.scratchio.crm.repository;

import com.scratchio.crm.entity.Notification;
import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.NotificationPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long>, JpaSpecificationExecutor<Notification> {

    @Query("SELECT n FROM Notification n WHERE n.recipientUser = :recipient ORDER BY n.createdAt DESC")
    List<Notification> findAllByRecipientOrderByCreatedAtDesc(@Param("recipient") User recipient);

    @Query("SELECT n FROM Notification n WHERE n.recipientUser = :recipient AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadNotifications(@Param("recipient") User recipient);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientUser = :recipient AND n.isRead = false")
    long countUnreadNotifications(@Param("recipient") User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId")
    void markNotificationRead(@Param("notificationId") Long notificationId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientUser = :recipient AND n.isRead = false")
    void markAllRead(@Param("recipient") User recipient);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.id = :notificationId")
    void deleteNotification(@Param("notificationId") Long notificationId);

    // Additional methods required by the NotificationService for stats and bulk delete
    long countByRecipientUserId(Long recipientUserId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientUser.id = :recipientUserId AND n.createdAt >= :since")
    long countTodayNotifications(@Param("recipientUserId") Long recipientUserId, @Param("since") LocalDateTime since);

    long countByRecipientUserIdAndPriority(Long recipientUserId, NotificationPriority priority);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipientUser.id = :recipientUserId")
    void deleteAllForRecipient(@Param("recipientUserId") Long recipientUserId);
}

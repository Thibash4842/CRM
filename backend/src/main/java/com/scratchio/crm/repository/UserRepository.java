package com.scratchio.crm.repository;

import com.scratchio.crm.entity.User;
import com.scratchio.crm.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
    List<User> findByRole(Role role);
    List<User> findByIsActiveTrue();
}

package com.library.management.repository;

import com.library.management.model.Role;
import com.library.management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    java.util.List<User> findByRole(Role role);

    java.util.List<User> findAllByOrderByCreatedAtDesc();
}

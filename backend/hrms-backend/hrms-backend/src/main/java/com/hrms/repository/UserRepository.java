package com.hrms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hrms.models.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);


    Optional<User> findByResetToken(String resetToken); // for password reset

    boolean existsByEmail(String email);


    boolean existsByUsername(String username);

    boolean existsByMobileNumber(String mobileNumber);

    List<User> findByRole(String role);


    List<User> findByDepartment(String department);

    List<User> findByStatus(String status);

    List<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);
}
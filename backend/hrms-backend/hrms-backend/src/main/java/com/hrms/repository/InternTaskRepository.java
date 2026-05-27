package com.hrms.repository;

import com.hrms.enums.TaskStatus;
import com.hrms.models.InternTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternTaskRepository extends JpaRepository<InternTask, Long> {

    // =========================
    // GET TASKS FOR INTERN
    // =========================
    List<InternTask> findByInternUsername(String username);

    // =========================
    // GET TASKS BY STATUS
    // =========================
    List<InternTask> findByInternUsernameAndStatus(String username, TaskStatus status);

    // =========================
    // GET TASKS CREATED BY ADMIN
    // =========================
    List<InternTask> findByCreatedByUsername(String username);

    // =========================
    // COUNT TASKS (Dashboard)
    // =========================
    long countByInternUsername(String username);

    long countByInternUsernameAndStatus(String username, TaskStatus status);

    List<InternTask> findAll();
}
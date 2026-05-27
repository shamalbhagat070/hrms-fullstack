package com.hrms.repository;

import com.hrms.models.Leave;
import com.hrms.enums.LeaveStatus;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeaveRepository extends JpaRepository<Leave, Long> {

    // ✅ Get all leaves by status
    List<Leave> findByStatus(LeaveStatus status);

    // ✅ Get leaves by user
    List<Leave> findByUserId(Long userId);

    // ✅ Correct monthly leave (handles overlapping dates)
    @Query("""
        SELECT l FROM Leave l
        WHERE l.user.id = :userId
        AND l.status = :status
        AND (
            l.startDate <= :endDate AND l.endDate >= :startDate
        )
    """)
    List<Leave> getLeavesForMonth(
            @Param("userId") Long userId,
            @Param("status") LeaveStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // ✅ Count by enum (safe)
    long countByStatus(LeaveStatus status);

    @Query("SELECT l FROM Leave l WHERE l.status = com.hrms.enums.LeaveStatus.APPROVED AND :today >= l.startDate AND :today <= l.endDate")
    List<Leave> findApprovedLeavesForToday(LocalDate today);

    List<Leave> findByUserUsername(String username);

    List<Leave> findTop5ByUserIdOrderByStartDateDesc(Long userId);
}
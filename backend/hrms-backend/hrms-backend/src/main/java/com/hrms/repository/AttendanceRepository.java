package com.hrms.repository;

import com.hrms.models.Attendance;
import com.hrms.enums.Status;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.*;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // ✅ Get attendance by date
    List<Attendance> findByDate(LocalDate date);

    // ✅ Find by user + date
    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);

    // ✅ Count by status (ALL TIME)
    long countByStatus(Status status);

    // ✅ Count by date + status (IMPORTANT for dashboard)
    long countByDateAndStatus(LocalDate date, Status status);

    // ✅ Monthly attendance
    @Query("""
        SELECT a FROM Attendance a
        WHERE MONTH(a.date) = :month AND YEAR(a.date) = :year
    """)
    List<Attendance> getMonthlyAttendance(@Param("month") int month,
                                          @Param("year") int year);


    @Query("""
    SELECT COUNT(a)
    FROM Attendance a
    WHERE a.user.id = :userId
    AND MONTH(a.date) = :month
    AND YEAR(a.date) = :year
    AND a.status = 'PRESENT'
""")
    long countPresent(@Param("userId") Long userId,
                      @Param("month") int month,
                      @Param("year") int year);


    @Query("""
    SELECT COUNT(a)
    FROM Attendance a
    WHERE a.user.id = :userId
    AND MONTH(a.date) = :month
    AND YEAR(a.date) = :year
    AND a.status = 'ABSENT'
""")
    long countAbsent(@Param("userId") Long userId,
                     @Param("month") int month,
                     @Param("year") int year);


    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = 'PRESENT' AND a.date = CURRENT_DATE")
    long countTodayPresent();

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = 'ABSENT' AND a.date = CURRENT_DATE")
    long countTodayAbsent();

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = 'LEAVE' AND a.date = CURRENT_DATE")
    long countTodayLeave();

    @Query("""
    SELECT COUNT(a)
    FROM Attendance a
    WHERE a.user.id = :userId
    AND MONTH(a.date) = :month
    AND YEAR(a.date) = :year
    AND a.status = 'LEAVE'
""")
    long countLeave(@Param("userId") Long userId,
                    @Param("month") int month,
                    @Param("year") int year);

    boolean existsByUserIdAndDate(Long id, LocalDate today);

    List<Attendance> findByUserUsername(String username);

    Optional<Attendance> findByUserUsernameAndDate(String username, LocalDate date);

    List<Attendance> findTop5ByUserIdOrderByDateDesc(Long userId);

    @Query("""
    SELECT a.status FROM Attendance a 
    WHERE a.user.id = :userId 
    AND a.date = :date
""")
    Optional<Attendance> findTodayStatus(
            @Param("userId") Long userId,
            @Param("date") LocalDate date
    );


    List<Attendance> findByUserId(Long id);

    List<Attendance> findByUserUsernameOrderByDateDesc(String username);


    boolean existsByUserUsernameAndDate(String username, LocalDate date);

    @Query("""
SELECT SUM(
    CASE 
        WHEN a.status = 'PRESENT' THEN 1
        WHEN a.status = 'HALF_DAY' THEN 0.5
        ELSE 0
    END
)
FROM Attendance a
WHERE a.user.id = :userId
AND MONTH(a.date) = :month
AND YEAR(a.date) = :year
""")
    Double getTotalWorkedDays(Long userId, int month, int year);
}
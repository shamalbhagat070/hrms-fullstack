package com.hrms.repository;

import com.hrms.models.Salary;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Page<Salary> findByMonthAndYear(int month, int year, Pageable pageable);

    void deleteByMonthAndYear(int month, int year);

    void deleteByUserIdAndMonthAndYear(Long userId, int month, int year);

    @Query("SELECT COALESCE(SUM(s.netSalary), 0) FROM Salary s")
    Double getTotalPayroll();

    // ✅ Search
    @Query("""
        SELECT s FROM Salary s
        WHERE 
        (LOWER(s.user.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
        OR LOWER(s.user.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
        AND s.month = :month
        AND s.year = :year
    """)
    Page<Salary> searchByNameAndMonthYear(@Param("name") String name,
                                          @Param("month") int month,
                                          @Param("year") int year,
                                          Pageable pageable);

    // 🔥 FIXED: Monthly Payroll (NO salaryDate dependency)
    @Query("""
        SELECT s.month, COALESCE(SUM(s.netSalary), 0)
        FROM Salary s
        WHERE s.year = :year
        GROUP BY s.month
        ORDER BY s.month
    """)
    List<Object[]> getMonthlyPayrollSummary(@Param("year") int year);


    @Query("""
    SELECT s.month, s.year 
    FROM Salary s 
    WHERE s.user.username = :username
    ORDER BY s.year DESC, s.month DESC
""")
    List<Object[]> findAvailableMonths(String username);


    Optional<Salary> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    boolean existsByUserUsernameAndMonthAndYear(
            String username, int month, int year
    );

    List<Salary> findByUserUsernameAndMonthAndYear(
            String username, int month, int year);

}
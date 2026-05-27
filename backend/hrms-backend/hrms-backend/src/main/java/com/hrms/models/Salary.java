package com.hrms.models;

import com.hrms.enums.SalaryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Entity
@Getter
@Setter
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔗 Relation with User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private double basic;
    private double allowances;

    private double pf;
    private double tax;

    private double leaveDeduction;
    private double deductions;
    private double netSalary;

    // Tracking
    private double unpaidLeaveDays;
    private double absentDays;

    private int month;
    private int year;
    private LocalDate salaryDate;
    @Enumerated(EnumType.STRING)
    private SalaryStatus status;
}

package com.hrms.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SalaryResponse {

    private Long id;
    private Long userId;
    private String userName;

    private double basic;
    private double allowances;

    private double pf;
    private double tax;

    private double leaveDeduction;
    private double deductions;
    private double netSalary;

    private double unpaidLeaveDays;
    private double absentDays;

    private int month;
    private int year;

    private String status;
}
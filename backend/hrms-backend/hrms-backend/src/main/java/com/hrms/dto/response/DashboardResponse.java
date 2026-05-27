package com.hrms.dto.response;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DashboardResponse {

    private long totalEmployees;
    private long pendingLeaves;
    private double totalPayroll;

    private int todayPresent;
    private int todayAbsent;
    private int todayLeave;
}
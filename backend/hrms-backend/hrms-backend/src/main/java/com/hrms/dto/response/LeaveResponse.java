package com.hrms.dto.response;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveResponse {

    private Long id;

    private Long userId;

    private String employeeName;

    private String leaveType;

    private LocalDate startDate;
    private LocalDate endDate;

    private String status;

    private String reason;

    // ✅ Half-day info
    private String halfDayType;

    // ✅ Audit fields
    private LocalDate appliedDate;
    private LocalDate approvedDate;
    private String approvedBy;
    private double totalDays;

}
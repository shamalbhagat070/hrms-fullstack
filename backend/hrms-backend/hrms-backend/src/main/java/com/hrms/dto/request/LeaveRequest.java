package com.hrms.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequest {

    private Long userId;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String halfDayType;
}




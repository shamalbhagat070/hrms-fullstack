package com.hrms.dto.response;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpDashboardResponse {

    private String todayStatus;

    private double leavesTaken;
    private double remainingLeaves;

    private String salaryStatus;

    private int presentDays;
    private int absentDays;
    private int leaveDays;

    private List<String> chartLabels;
    private List<Integer> chartValues;

    private List<String> recentDates;
    private List<String> recentStatus;

    private List<String> leaveDates;
    private List<String> leaveTypes;
    private List<String> leaveStatus;
}
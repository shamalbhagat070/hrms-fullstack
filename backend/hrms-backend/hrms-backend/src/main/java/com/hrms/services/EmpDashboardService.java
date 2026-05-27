package com.hrms.services;

import com.hrms.dto.response.EmpDashboardResponse;
import com.hrms.enums.*;
import com.hrms.models.*;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EmpDashboardService {

    private final AttendanceRepository attendanceRepo;
    private final LeaveRepository leaveRepo;
    private final SalaryRepository salaryRepo;
    private final UserRepository userRepo;

    public EmpDashboardResponse getDashboard(String username) {

        User user = userRepo.findByUsername(username).orElseThrow();

        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        // =========================
        // TODAY STATUS
        // =========================
        String todayStatus = attendanceRepo
                .findByUserIdAndDate(user.getId(), LocalDate.now())
                .map(a -> a.getStatus().name())
                .orElse("Not Marked");

        // =========================
        // ATTENDANCE DATA
        // =========================
        List<Attendance> attendanceList =
                attendanceRepo.findByUserId(user.getId());

        Set<LocalDate> presentDaysSet = new HashSet<>();
        Set<LocalDate> leaveDaysSet = new HashSet<>();

        for (Attendance a : attendanceList) {

            if (a.getDate().getMonthValue() != month ||
                    a.getDate().getYear() != year) continue;

            if (a.getStatus() == Status.PRESENT) {
                presentDaysSet.add(a.getDate());
            }
            else if (a.getStatus() == Status.LEAVE) {
                leaveDaysSet.add(a.getDate());
            }
        }

        int present = presentDaysSet.size();
        int leaveDays = leaveDaysSet.size();

        // =========================
        // WORKING DAYS (Mon–Fri)
        // =========================
        int workingDays = 0;

        LocalDate date = LocalDate.of(year, month, 1);
        LocalDate end = date.withDayOfMonth(date.lengthOfMonth());

        while (!date.isAfter(end)) {
            if (date.getDayOfWeek().getValue() < 6) {
                workingDays++;
            }
            date = date.plusDays(1);
        }

        // =========================
        // ABSENT DAYS
        // =========================
        int absent = workingDays - (present + leaveDays);
        if (absent < 0) absent = 0;

        // =========================
        // LEAVE CALCULATION (REAL HRMS)
        // =========================
        List<Leave> leaves = leaveRepo.findByUserId(user.getId());

        double leavesTaken = leaves.stream()
                .filter(l -> l.getStatus() == LeaveStatus.APPROVED)
                .mapToDouble(l -> {
                    double days = ChronoUnit.DAYS.between(
                            l.getStartDate(),
                            l.getEndDate()
                    ) + 1;

                    if (l.getHalfDayType() != null &&
                            l.getHalfDayType() != HalfDayType.NONE) {
                        days -= 0.5;
                    }

                    return days;
                }).sum();

        double remainingLeaves = 37 - leavesTaken; // (12+10+15)
        if (remainingLeaves < 0) remainingLeaves = 0;

        // =========================
        // SALARY STATUS
        // =========================
        String salaryStatus = salaryRepo
                .findByUserIdAndMonthAndYear(user.getId(), month, year)
                .map(s -> {
                    if (s.getStatus() == SalaryStatus.PAID) return "Paid";
                    if (s.getStatus() == SalaryStatus.APPROVED) return "Approved";
                    if (s.getStatus() == SalaryStatus.GENERATED) return "Generated";
                    return "Pending";
                })
                .orElse("Not Generated");
        // =========================
        // CHART DATA
        // =========================
        List<String> chartLabels = List.of("Present", "Absent", "Leave");
        List<Integer> chartValues = List.of(present, absent, leaveDays);

        // =========================
        // RECENT ATTENDANCE
        // =========================
        List<Attendance> recentAttendance =
                attendanceRepo.findTop5ByUserIdOrderByDateDesc(user.getId());

        List<String> recentDates = new ArrayList<>();
        List<String> recentStatus = new ArrayList<>();

        for (Attendance a : recentAttendance) {

            if (a.getDate().getMonthValue() != month) continue;

            recentDates.add(a.getDate().toString());
            recentStatus.add(a.getStatus().name());
        }

        // =========================
        // RECENT LEAVES (DATE RANGE)
        // =========================
        List<Leave> recentLeaves =
                leaveRepo.findTop5ByUserIdOrderByStartDateDesc(user.getId());

        List<String> leaveDates = new ArrayList<>();
        List<String> leaveTypes = new ArrayList<>();
        List<String> leaveStatus = new ArrayList<>();

        for (Leave l : recentLeaves) {

            leaveDates.add(
                    l.getStartDate().getDayOfMonth() + " " +
                            l.getStartDate().getMonth().name().substring(0,3)
                            + " - " +
                            l.getEndDate().getDayOfMonth() + " " +
                            l.getEndDate().getMonth().name().substring(0,3)
            );

            leaveTypes.add(l.getLeaveType().name());
            leaveStatus.add(l.getStatus().name());
        }

        // =========================
        // FINAL RESPONSE
        // =========================
        return new EmpDashboardResponse(
                todayStatus,
                leavesTaken,
                remainingLeaves,
                salaryStatus,
                present,
                absent,
                leaveDays,
                chartLabels,
                chartValues,
                recentDates,
                recentStatus,
                leaveDates,
                leaveTypes,
                leaveStatus
        );
    }
}
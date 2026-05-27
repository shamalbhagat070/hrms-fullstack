package com.hrms.services;

import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.LeaveRepository;
import com.hrms.repository.SalaryRepository;
import com.hrms.services.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AttendanceRepository attendanceRepo;
    private final AttendanceService attendanceService;
    private final SalaryRepository salaryRepository; // ✅ ADD THIS

    public Map<String, Object> getTodayStats(String username) {

        // 🔥 ORDER IS IMPORTANT
        attendanceService.markTodayLeaveUsers();
        attendanceService.markAbsentUsers();

        Map<String, Object> stats = new HashMap<>();

        stats.put("present", attendanceRepo.countTodayPresent());
        stats.put("absent", attendanceRepo.countTodayAbsent());
        stats.put("leave", attendanceRepo.countTodayLeave());

        // ✅ ADD SALARY STATUS
        int month = java.time.LocalDate.now().getMonthValue();
        int year = java.time.LocalDate.now().getYear();

        boolean isGenerated = salaryRepository
                .existsByUserUsernameAndMonthAndYear(username, month, year);

        stats.put("salaryStatus", isGenerated ? "Generated" : "Not Generated");

        return stats;
    }
}

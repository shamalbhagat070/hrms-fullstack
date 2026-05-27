package com.hrms.controllers;

import com.hrms.dto.response.AttendanceResponse;
import com.hrms.services.AttendanceService;
import com.hrms.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final DashboardService dashboardService;

    // ===============================
    // CHECK-IN
    // ===============================
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(Authentication auth) {
        attendanceService.checkIn(auth.getName());
        return ResponseEntity.ok("Checked In ✅");
    }

    // ===============================
    // CHECK-OUT
    // ===============================
    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(Authentication auth) {
        attendanceService.checkOut(auth.getName());
        return ResponseEntity.ok("Checked Out ✅");
    }

    // ===============================
    // MY ATTENDANCE
    // ===============================
    @GetMapping("/my")
    public ResponseEntity<?> myAttendance(Authentication auth) {
        return ResponseEntity.ok(attendanceService.getMyAttendance(auth.getName()));
    }

    @GetMapping("/trends")
    public Map<String, Integer> getTrend() {

        LocalDate now = LocalDate.now();

        return attendanceService.getMonthlyTrend(
                now.getMonthValue(),
                now.getYear()
        );
    }


    @GetMapping("/monthly")
    public List<AttendanceResponse> getMonthlyReport(
            @RequestParam int month,
            @RequestParam int year) {

        return attendanceService.getMonthlyReport(month, year);
    }

    // ===============================
    // DASHBOARD
    // ===============================
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard(Authentication auth) {
        return dashboardService.getTodayStats(auth.getName());
    }

    // ===============================
    // FULL TABLE
    // ===============================
    @GetMapping("/today-full")
    public List<AttendanceResponse> getTodayFullAttendance() {
        return attendanceService.getTodayFullAttendance();
    }

    @GetMapping("/summary")
    public Map<String, Integer> getAttendanceSummary() {

        return attendanceService.getAttendanceSummary();
    }

    @PostMapping("/check-out/{userId}")
    public ResponseEntity<?> checkOut(@PathVariable Long userId) {
        attendanceService.checkOutByAdmin(userId);
        return ResponseEntity.ok("Checked Out ✅");
    }

    @PostMapping("/check-in/{userId}")
    public ResponseEntity<?> checkIn(@PathVariable Long userId) {
        attendanceService.checkInByAdmin(userId);
        return ResponseEntity.ok("Checked In ✅");
    }
}


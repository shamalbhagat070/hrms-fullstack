package com.hrms.controllers;

import com.hrms.dto.response.EmpDashboardResponse;
import com.hrms.services.EmpDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee/dashboard")
@RequiredArgsConstructor
@CrossOrigin
public class EmpDashboardController {

    private final EmpDashboardService service;

    // ✅ GET EMPLOYEE DASHBOARD
    @GetMapping
    public ResponseEntity<EmpDashboardResponse> getDashboard(Authentication auth) {

        return ResponseEntity.ok(
                service.getDashboard(auth.getName())
        );
    }
}
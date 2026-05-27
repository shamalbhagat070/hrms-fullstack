package com.hrms.controllers;

import com.hrms.dto.request.LeaveRequest;
import com.hrms.dto.response.LeaveResponse;
import com.hrms.enums.LeaveStatus;
import com.hrms.services.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@CrossOrigin
public class LeaveController {

    private final LeaveService service;


    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(
            Authentication auth,
            @RequestBody LeaveRequest req) {

        return ResponseEntity.ok(
                service.applyLeave(auth.getName(), req)
        );
    }

    @PutMapping("/approve/{id}")
    public LeaveResponse approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PutMapping("/reject/{id}")
    public LeaveResponse reject(@PathVariable Long id) {
        return service.reject(id);
    }

    @GetMapping
    public List<LeaveResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/user/{id}")
    public List<LeaveResponse> getUserLeaves(@PathVariable Long id) {
        return service.getUserLeaves(id);
    }

    @GetMapping("/pending")
    public List<LeaveResponse> pending() {
        return service.getPending();
    }

    @GetMapping("/my")
    public ResponseEntity<?> myLeaves(Authentication auth) {
        return ResponseEntity.ok(
                service.getMyLeaves(auth.getName())
        );
    }

    // ADMIN APPROVE / REJECT
    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam LeaveStatus status) {

        return ResponseEntity.ok(
                service.updateStatus(id, status)
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getLeaveSummary(Authentication auth) {
        return ResponseEntity.ok(
                service.getLeaveSummary(auth.getName())
        );
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getLeaveBalance(Authentication auth) {
        return ResponseEntity.ok(
                service.getLeaveSummary(auth.getName())
        );
    }
}

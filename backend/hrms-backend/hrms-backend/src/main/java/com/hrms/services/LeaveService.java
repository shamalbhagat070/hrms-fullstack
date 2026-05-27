package com.hrms.services;

import com.hrms.dto.request.LeaveRequest;
import com.hrms.dto.response.LeaveResponse;
import com.hrms.models.*;
import com.hrms.enums.*;
import com.hrms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveService {

    private final LeaveRepository leaveRepo;
    private final UserRepository userRepo;
    private final LeaveBalanceRepository balanceRepo;
    private final HolidayRepository holidayRepo;
    private final EmailService emailService;
    private final AttendanceService attendanceService;


    private static final double MAX_CASUAL = 12;
    private static final double MAX_PAID = 15;
    private static final double MAX_SICK = 10;

    // ================= APPROVE LEAVE =================
    @Transactional
    public LeaveResponse approve(Long id) {

        Leave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Leave already processed");
        }

        // ✅ Auto create balance if not exists
        LeaveBalance balance = balanceRepo
                .findByUserId(leave.getUser().getId())
                .orElseGet(() -> {
                    LeaveBalance b = new LeaveBalance();
                    b.setUser(leave.getUser());
                    b.setCasualLeave(10);
                    b.setSickLeave(8);
                    b.setPaidLeave(15);
                    return balanceRepo.save(b);
                });

        double days = calculateDays(leave);

        if (days <= 0) {
            throw new RuntimeException("Invalid leave days");
        }

        // ✅ Deduct leave
        switch (leave.getLeaveType()) {

            case CASUAL -> {
                if (balance.getCasualLeave() < days)
                    throw new RuntimeException("Not enough CL");
                balance.setCasualLeave((int) (balance.getCasualLeave() - days));
            }

            case SICK -> {
                if (balance.getSickLeave() < days)
                    throw new RuntimeException("Not enough SL");
                balance.setSickLeave((int) (balance.getSickLeave() - days));
            }

            case PAID -> {
                if (balance.getPaidLeave() < days)
                    throw new RuntimeException("Not enough PL");
                balance.setPaidLeave((int) (balance.getPaidLeave() - days));
            }
        }

        leave.setStatus(LeaveStatus.APPROVED);
        leave.setApprovedDate(LocalDate.now());
        leave.setApprovedBy("ADMIN");

        balanceRepo.save(balance);
        Leave saved = leaveRepo.save(leave);

        // 🔥🔥🔥 ADD THIS BLOCK (MOST IMPORTANT FIX)
        attendanceService.markLeave(
                leave.getUser(),
                leave.getStartDate(),
                leave.getEndDate()
        );

        // ✅ Email
        emailService.send(
                leave.getUser().getEmail(),
                leave.getUser().getFirstName(),
                "Your leave from " + leave.getStartDate() +
                        " to " + leave.getEndDate() + " is APPROVED"
        );

        log.info("Leave approved for user {}", leave.getUser().getId());

        return map(saved);
    }

    // ================= REJECT =================
    public LeaveResponse reject(Long id) {

        Leave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new RuntimeException("Leave already processed");
        }

        leave.setStatus(LeaveStatus.REJECTED);

        Leave saved = leaveRepo.save(leave);

        // ✅ Email
        emailService.send(
                leave.getUser().getEmail(),
                leave.getUser().getFirstName(),
                "Your leave request is REJECTED"
        );

        return map(saved);
    }

    // ================= GET ALL =================
    public List<LeaveResponse> getAll() {
        return leaveRepo.findAll().stream().map(this::map).toList();
    }


    // ================= GET USER =================
    public List<LeaveResponse> getUserLeaves(Long userId) {
        return leaveRepo.findByUserId(userId).stream().map(this::map).toList();
    }



    // ================= GET PENDING =================
    public List<LeaveResponse> getPending() {
        return leaveRepo.findByStatus(LeaveStatus.PENDING).stream().map(this::map).toList();
    }



    // ================= ANALYTICS =================
    public Map<String, Object> analytics() {

        List<Leave> list = leaveRepo.findAll();

        Map<String, Object> map = new HashMap<>();
        map.put("total", list.size());
        map.put("approved", list.stream().filter(l -> l.getStatus() == LeaveStatus.APPROVED).count());
        map.put("pending", list.stream().filter(l -> l.getStatus() == LeaveStatus.PENDING).count());
        map.put("rejected", list.stream().filter(l -> l.getStatus() == LeaveStatus.REJECTED).count());

        return map;
    }



    // ================= CALCULATE DAYS =================
    private double calculateDays(Leave leave) {

        Set<LocalDate> holidays = holidayRepo.findAll()
                .stream()
                .map(Holiday::getDate)
                .collect(Collectors.toSet());

        double days = 0;
        LocalDate current = leave.getStartDate();

        while (!current.isAfter(leave.getEndDate())) {

            boolean weekend = current.getDayOfWeek().getValue() >= 6;
            boolean holiday = holidays.contains(current);

            if (!weekend && !holiday) {
                days++;
            }

            current = current.plusDays(1);
        }

        // ✅ FIXED HALF-DAY LOGIC
        if (leave.getHalfDayType() == HalfDayType.FIRST_HALF ||
                leave.getHalfDayType() == HalfDayType.SECOND_HALF) {

            return days - 0.5;
        }

        return days; // FULL_DAY or NONE
    }

    // ================= MAPPER =================
    private LeaveResponse map(Leave l) {

        LeaveResponse r = new LeaveResponse();

        r.setId(l.getId());
        r.setUserId(l.getUser().getId());
        r.setEmployeeName(
                l.getUser().getFirstName() + " " + l.getUser().getLastName()
        );
        r.setLeaveType(l.getLeaveType().name());
        r.setStartDate(l.getStartDate());
        r.setEndDate(l.getEndDate());
        r.setStatus(l.getStatus().name());
        r.setReason(l.getReason());
        r.setTotalDays(calculateDays(l));

        return r;
    }

    public LeaveResponse applyLeave(String username, LeaveRequest req) {

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found ❌"));

        // ✅ Get current usage
        Map<String, Object> summary = getLeaveSummary(username);

        LeaveType leaveType = LeaveType.valueOf(req.getLeaveType().toUpperCase());

        HalfDayType halfDayType = (req.getHalfDayType() != null)
                ? HalfDayType.valueOf(req.getHalfDayType().toUpperCase())
                : HalfDayType.FULL_DAY;

        Leave tempLeave = new Leave();
        tempLeave.setStartDate(req.getStartDate());
        tempLeave.setEndDate(req.getEndDate());
        tempLeave.setHalfDayType(halfDayType);

        double requestedDays = calculateDays(tempLeave);

        // ✅ VALIDATION
        if (leaveType == LeaveType.CASUAL) {
            double used = (double) summary.get("casualUsed");
            if (used + requestedDays > MAX_CASUAL) {
                throw new RuntimeException("Casual leave limit exceeded!");
            }
        }

        if (leaveType == LeaveType.PAID) {
            double used = (double) summary.get("paidUsed");
            if (used + requestedDays > MAX_PAID) {
                throw new RuntimeException("Paid leave limit exceeded!");
            }
        }

        if (leaveType == LeaveType.SICK) {
            double used = (double) summary.get("sickUsed");
            if (used + requestedDays > MAX_SICK) {
                throw new RuntimeException("Sick leave limit exceeded!");
            }
        }

        // ✅ CREATE ENTITY
        Leave leave = new Leave();
        leave.setUser(user);
        leave.setLeaveType(leaveType);
        leave.setStartDate(req.getStartDate());
        leave.setEndDate(req.getEndDate());
        leave.setReason(req.getReason());
        leave.setHalfDayType(halfDayType);
        leave.setStatus(LeaveStatus.PENDING);
        leave.setAppliedDate(LocalDate.now());

        return map(leaveRepo.save(leave));
    }




    // GET MY LEAVES
    public List<LeaveResponse> getMyLeaves(String username) {

        return leaveRepo.findByUserUsername(username)
                .stream()
                .map(this::map)
                .toList();
    }


    // APPROVE / REJECT (ADMIN)
    public Leave updateStatus(Long id, LeaveStatus status) {

        Leave leave = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        leave.setStatus(status);

        return leaveRepo.save(leave);
    }


    public Map<String, Object> getLeaveSummary(String username) {

        List<Leave> leaves = leaveRepo.findByUserUsername(username);

        double casual = 0, paid = 0, sick = 0, unpaid = 0;
        Map<String, Double> monthly = new HashMap<>();

        int currentYear = LocalDate.now().getYear();

        for (Leave leave : leaves) {

            if (leave.getStatus() != LeaveStatus.APPROVED) continue;

            // ✅ Year filter
            if (leave.getStartDate().getYear() != currentYear) continue;

            // ✅ CORRECT calculation
            double days = calculateDays(leave);

            // ✅ Monthly breakdown
            String month = leave.getStartDate().getMonth().toString();
            monthly.put(month, monthly.getOrDefault(month, 0.0) + days);

            // ✅ Type-wise
            switch (leave.getLeaveType()) {
                case CASUAL:
                    casual += days;
                    break;
                case PAID:
                    paid += days;
                    break;
                case SICK:
                    sick += days;
                    break;
                case UNPAID:
                    unpaid += days;
                    break;
            }
        }

        Map<String, Object> res = new HashMap<>();

        res.put("casualUsed", casual);
        res.put("paidUsed", paid);
        res.put("sickUsed", sick);
        res.put("unpaidUsed", unpaid);

        res.put("casualRemaining", MAX_CASUAL - casual);
        res.put("paidRemaining", MAX_PAID - paid);
        res.put("sickRemaining", MAX_SICK - sick);
        res.put("unpaidRemaining", "Unlimited");

        res.put("monthlyBreakdown", monthly);

        return res;
    }
}
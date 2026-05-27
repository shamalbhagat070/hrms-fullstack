package com.hrms.services;

import com.hrms.enums.Status;
import com.hrms.dto.response.AttendanceResponse;
import com.hrms.models.Attendance;
import com.hrms.models.Leave;
import com.hrms.models.User;
import com.hrms.repository.AttendanceRepository;
import com.hrms.repository.LeaveRepository;
import com.hrms.repository.UserRepository;
import com.hrms.enums.Status;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final LeaveRepository leaveRepository;

    /* ===============================
       TODAY FULL (ALL EMPLOYEES)
    ============================== */
    public List<AttendanceResponse> getTodayFullAttendance() {

        LocalDate today = LocalDate.now();

        List<User> users = userRepository.findAll();
        List<Attendance> attendanceList = attendanceRepository.findByDate(today);

        // Map<userId, Attendance>
        Map<Long, Attendance> attendanceMap = new HashMap<>();

        for (Attendance a : attendanceList) {
            attendanceMap.put(a.getUser().getId(), a);
        }

        List<AttendanceResponse> result = new ArrayList<>();

        for (User user : users) {

            Attendance a = attendanceMap.get(user.getId());

            if (a != null) {

                result.add(new AttendanceResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        a.getDate(),
                        a.getStatus() != null ? a.getStatus().name() : Status.ABSENT.name(),
                        a.getCheckIn(),
                        a.getCheckOut()
                ));

            } else {

                result.add(new AttendanceResponse(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        today,
                        Status.ABSENT.name(),   // ✅ FIXED
                        null,
                        null
                ));
            }
        }

        return result;
    }

    /* ===============================
       DASHBOARD
    ============================== */
    public Map<String, Long> getAttendanceOverview() {

        LocalDate today = LocalDate.now();

        Map<String, Long> map = new HashMap<>();

        long present = attendanceRepository.countByDateAndStatus(today, Status.PRESENT);
        long absent = attendanceRepository.countByDateAndStatus(today, Status.ABSENT);
        long leave = attendanceRepository.countByDateAndStatus(today, Status.LEAVE);

        map.put("present", present);
        map.put("absent", absent);
        map.put("leave", leave);

        return map;
    }


    /* ===============================
       MONTHLY REPORT
    ============================== */
    public List<AttendanceResponse> getMonthlyReport(int month, int year) {

        List<User> users = userRepository.findAll();
        List<Attendance> attendanceList =
                attendanceRepository.getMonthlyAttendance(month, year);

        // ✅ Proper mapping: userId → (date → attendance)
        Map<Long, Map<LocalDate, Attendance>> attendanceMap = new HashMap<>();

        for (Attendance a : attendanceList) {

            Long userId = a.getUser().getId();
            LocalDate date = a.getDate();

            attendanceMap
                    .computeIfAbsent(userId, k -> new HashMap<>())
                    .put(date, a);
        }

        List<AttendanceResponse> result = new ArrayList<>();


        YearMonth yearMonth = YearMonth.of(year, month);
        int daysInMonth = yearMonth.lengthOfMonth();

        for (User user : users) {

            Map<LocalDate, Attendance> userAttendance =
                    attendanceMap.getOrDefault(user.getId(), new HashMap<>());

            for (int day = 1; day <= daysInMonth; day++) {

                LocalDate date = LocalDate.of(year, month, day);

                if (userAttendance.containsKey(date)) {

                    Attendance a = userAttendance.get(date);

                    result.add(new AttendanceResponse(
                            user.getId(),
                            user.getFirstName(),
                            user.getLastName(),
                            date,
                            a.getStatus().name(),
                            a.getCheckIn(),
                            a.getCheckOut()
                    ));

                } else {

                    result.add(new AttendanceResponse(
                            user.getId(),
                            user.getFirstName(),
                            user.getLastName(),
                            date,
                            Status.ABSENT.name(),
                            null,
                            null
                    ));
                }
            }
        }

        return result;
    }

    public Map<String, Integer> getMonthlyTrend(int month, int year) {

        Map<String, Integer> result = new LinkedHashMap<>();

        YearMonth yearMonth = YearMonth.of(year, month);

        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {

            LocalDate date = LocalDate.of(year, month, day);

            int count = Math.toIntExact(attendanceRepository
                    .countByDateAndStatus(date, Status.PRESENT));

            result.put(date.toString(), count);
        }

        return result;
    }


    public Map<String, Map<String, Long>> getEmployeeSummary(int month, int year) {

        List<Attendance> list = attendanceRepository.getMonthlyAttendance(month, year);

        Map<String, Map<String, Long>> result = new HashMap<>();

        for (Attendance a : list) {

            String name = a.getUser().getFirstName();

            result.putIfAbsent(name, new HashMap<>());

            Map<String, Long> stats = result.get(name);

            String status = a.getStatus().name();

            stats.put(status, stats.getOrDefault(status, 0L) + 1);
        }

        return result;
    }


    // ===============================
// GET MY ATTENDANCE
// ===============================
    public List<AttendanceResponse> getMyAttendance(String username) {

        List<Attendance> list =
                attendanceRepository.findByUserUsernameOrderByDateDesc(username);

        List<AttendanceResponse> result = new ArrayList<>();

        for (Attendance a : list) {

            result.add(new AttendanceResponse(
                    a.getUser().getId(),
                    a.getUser().getFirstName(),
                    a.getUser().getLastName(),
                    a.getDate(),
                    //a.getStatus() != null ? a.getStatus().name() : "ABSENT",
                    null, // frontend will calculate status
                    a.getCheckIn(),
                    a.getCheckOut()
            ));
        }

        return result;
    }


    /* ===============================
       MARK LEAVE (VERY IMPORTANT)
    ============================== */
    public void markLeave(User user, LocalDate startDate, LocalDate endDate) {

        for (LocalDate date = startDate;
             !date.isAfter(endDate);
             date = date.plusDays(1)) {

            Optional<Attendance> existing =
                    attendanceRepository.findByUserIdAndDate(user.getId(), date);

            Attendance attendance = existing.orElse(new Attendance());

            attendance.setUser(user);
            attendance.setDate(date);
            attendance.setStatus(Status.LEAVE);

            // remove check-in/out if leave
            attendance.setCheckIn(null);
            attendance.setCheckOut(null);

            attendanceRepository.save(attendance);
        }
    }


    public void markAbsentUsers() {

        List<User> users = userRepository.findAll();
        LocalDate today = LocalDate.now();

        for (User user : users) {

            boolean exists = attendanceRepository
                    .existsByUserIdAndDate(user.getId(), today);

            if (!exists) {
                Attendance a = new Attendance();
                a.setUser(user);
                a.setDate(today);

                // 🔥 ONLY SET ABSENT IF NO CHECK-IN
                a.setStatus(Status.ABSENT);

                attendanceRepository.save(a);
            }
        }

    }

    public void markTodayLeaveUsers() {

        LocalDate today = LocalDate.now();

        List<Leave> leaves = leaveRepository.findApprovedLeavesForToday(today);

        System.out.println("TODAY: " + today);
        System.out.println("LEAVES FOUND: " + leaves.size());

        for (Leave l : leaves) {

            System.out.println("USER ON LEAVE: " + l.getUser().getId());

            Optional<Attendance> existing =
                    attendanceRepository.findByUserIdAndDate(l.getUser().getId(), today);

            Attendance a = existing.orElse(new Attendance());

            a.setUser(l.getUser());
            a.setDate(today);
            a.setStatus(Status.LEAVE);
            a.setCheckIn(null);
            a.setCheckOut(null);

            attendanceRepository.save(a);
        }
    }
    public void checkIn(String username) {

        LocalDate today = LocalDate.now();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Attendance> existing =
                attendanceRepository.findByUserUsernameAndDate(username, today);

        Attendance att;

        if (existing.isPresent()) {
            // ✅ UPDATE existing (VERY IMPORTANT FIX)
            att = existing.get();
        } else {
            att = new Attendance();
            att.setUser(user);
            att.setDate(today);
        }

        att.setCheckIn(LocalDateTime.now());
        att.setStatus(Status.PRESENT);

        attendanceRepository.save(att);
    }

    public void checkOut(String username) {

        Attendance att = attendanceRepository
                .findByUserUsernameAndDate(username, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Check-in first"));

        att.setCheckOut(LocalDateTime.now());

        // Optional: calculate hours / half-day logic later

        attendanceRepository.save(att);
    }

    public Map<String, Integer> getAttendanceSummary() {

        Map<String, Integer> map = new HashMap<>();

        int present = Math.toIntExact(attendanceRepository.countByStatus(Status.PRESENT));
        int absent = Math.toIntExact(attendanceRepository.countByStatus(Status.ABSENT));
        int leave = Math.toIntExact(attendanceRepository.countByStatus(Status.LEAVE));

        map.put("present", present);
        map.put("absent", absent);
        map.put("leave", leave);

        return map;
    }

    public void checkInByAdmin(Long userId) {

        LocalDate today = LocalDate.now();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Attendance> existing =
                attendanceRepository.findByUserIdAndDate(userId, today);

        Attendance att = existing.orElse(new Attendance());

        att.setUser(user);
        att.setDate(today);
        att.setCheckIn(LocalDateTime.now());
        att.setStatus(Status.PRESENT);

        attendanceRepository.save(att);
    }

    public void checkOutByAdmin(Long userId) {

        Attendance att = attendanceRepository
                .findByUserIdAndDate(userId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Check-in first"));

        att.setCheckOut(LocalDateTime.now());

        attendanceRepository.save(att);
    }
}

package com.hrms.services;

import com.hrms.enums.HalfDayType;
import com.hrms.enums.LeaveStatus;
import com.hrms.enums.LeaveType;
import com.hrms.enums.SalaryStatus;
import com.hrms.models.*;
import com.hrms.repository.*;
import com.hrms.dto.response.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

import java.io.InputStream;
import java.time.*;
import java.util.*;

@Service
public class SalaryService {

    @Autowired private SalaryRepository salaryRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private AttendanceRepository attendanceRepo;
    @Autowired private LeaveRepository leaveRepo;

    // ======================================================
    // 🔥 GENERATE SALARY (FIXED - NO DUPLICATES)
    // ======================================================
    @Transactional
    public synchronized void generateSalary(int month, int year, String search) {

        List<User> users;

        if (search != null && !search.trim().isEmpty()) {
            users = userRepo.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                    search.trim(), search.trim());
        } else {
            users = userRepo.findAll();
        }

        for (User user : users) {

            if (user.getSalary() == 0) continue;

            // ✅ CHECK EXISTING SALARY
            Optional<Salary> existing =
                    salaryRepo.findByUserIdAndMonthAndYear(user.getId(), month, year);

            // 🚫 SKIP if already generated
            if (existing.isPresent() &&
                    existing.get().getStatus() == SalaryStatus.GENERATED) {
                continue;
            }

            // ✅ SAFE UPSERT
            Salary salary;
            if (existing.isPresent()) {
                salary = existing.get(); // update
            } else {
                salary = new Salary();  // insert
                salary.setUser(user);
                salary.setMonth(month);
                salary.setYear(year);
            }

            double basic = user.getSalary();
            double allowances = basic * 0.20;
            double pf = basic * 0.12;

            YearMonth ym = YearMonth.of(year, month);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            // ✅ WORKING DAYS (EXCLUDE SUNDAYS)
            long workingDays = start.datesUntil(end.plusDays(1))
                    .filter(d -> d.getDayOfWeek() != DayOfWeek.SUNDAY)
                    .count();

            // ✅ PRESENT DAYS
            Double presentDays = attendanceRepo.getTotalWorkedDays(user.getId(), month, year);
            if (presentDays == null) presentDays = 0.0;

            // ✅ LEAVES
            List<Leave> leaves = leaveRepo.getLeavesForMonth(
                    user.getId(),
                    LeaveStatus.APPROVED,
                    start,
                    end
            );

            if (leaves == null) leaves = Collections.emptyList();

            double unpaidLeaveDays = leaves.stream()
                    .filter(l -> l.getLeaveType() == LeaveType.UNPAID)
                    .mapToDouble(l -> {
                        LocalDate s = l.getStartDate();
                        LocalDate e = l.getEndDate();

                        if (s.isBefore(start)) s = start;
                        if (e.isAfter(end)) e = end;

                        double days = s.datesUntil(e.plusDays(1))
                                .filter(d -> d.getDayOfWeek() != DayOfWeek.SUNDAY)
                                .count();

                        if (l.getHalfDayType() != null &&
                                l.getHalfDayType() != HalfDayType.NONE) {
                            days -= 0.5;
                        }

                        return days;
                    }).sum();

            double paidLeaveDays = leaves.stream()
                    .filter(l -> l.getLeaveType() != LeaveType.UNPAID)
                    .mapToDouble(l -> {
                        double days = l.getStartDate()
                                .datesUntil(l.getEndDate().plusDays(1))
                                .filter(d -> d.getDayOfWeek() != DayOfWeek.SUNDAY)
                                .count();

                        if (l.getHalfDayType() != null &&
                                l.getHalfDayType() != HalfDayType.NONE) {
                            days -= 0.5;
                        }

                        return days;
                    }).sum();

            if (unpaidLeaveDays > workingDays) {
                unpaidLeaveDays = workingDays;
            }

            int absentDays = (int) (workingDays - (presentDays + paidLeaveDays + unpaidLeaveDays));
            if (absentDays < 0) absentDays = 0;

            // ✅ SAFE DIVISION
            double perDay = workingDays > 0 ? basic / workingDays : 0;

            double leaveDeduction = perDay * unpaidLeaveDays;
            double gross = basic + allowances;

            // ✅ TAX SLAB
            double tax;
            if (gross <= 25000) tax = 0;
            else if (gross <= 50000) tax = gross * 0.10;
            else if (gross <= 100000) tax = gross * 0.20;
            else tax = gross * 0.30;

            double totalDeduction = pf + tax + leaveDeduction;
            double netSalary = gross - totalDeduction;

            // ✅ SET VALUES
            salary.setBasic(basic);
            salary.setAllowances(allowances);
            salary.setPf(pf);
            salary.setTax(tax);
            salary.setLeaveDeduction(leaveDeduction);
            salary.setDeductions(totalDeduction);
            salary.setNetSalary(netSalary);
            salary.setUnpaidLeaveDays(unpaidLeaveDays);
            salary.setAbsentDays(absentDays);
            salary.setSalaryDate(start);
            salary.setStatus(SalaryStatus.GENERATED);

            salaryRepo.save(salary);
        }
    }

    // ======================================================
    // 🔥 GET SALARY
    // ======================================================
    public Page<SalaryResponse> getSalary(int month, int year,
                                          int page, int size,
                                          String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Salary> salaryPage;

        if (search != null && !search.trim().isEmpty()) {
            salaryPage = salaryRepo.searchByNameAndMonthYear(
                    search.trim(), month, year, pageable);
        } else {
            salaryPage = salaryRepo.findByMonthAndYear(month, year, pageable);
        }

        return salaryPage.map(this::mapToDTO);
    }

    // ======================================================
    // 🔥 PAYSLIP PDF
    // ======================================================
    public byte[] generatePayslip(Long id) {

        Salary salary = salaryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Salary not found"));

        List<Salary> list = Collections.singletonList(salary);
        JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(list);

        try {
            InputStream reportStream = getClass()
                    .getResourceAsStream("/payslip.jrxml");

            if (reportStream == null) {
                throw new RuntimeException("JRXML file not found ❌");
            }

            JasperReport report = JasperCompileManager.compileReport(reportStream);

            JasperPrint print = JasperFillManager.fillReport(
                    report,
                    new HashMap<>(),
                    dataSource
            );

            return JasperExportManager.exportReportToPdf(print);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating payslip", e);
        }
    }

    // ======================================================
    // 🔥 MY SALARY
    // ======================================================
    public List<SalaryResponse> getMySalary(String username, int month, int year) {

        return salaryRepo
                .findByUserUsernameAndMonthAndYear(username, month, year)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ======================================================
    // 🔥 AVAILABLE MONTHS
    // ======================================================
    public List<Map<String, Object>> getAvailableMonths(String username) {

        List<Object[]> data = salaryRepo.findAvailableMonths(username);
        List<Map<String, Object>> result = new ArrayList<>();

        LocalDate now = LocalDate.now();

        for (Object[] row : data) {

            int month = (int) row[0];
            int year = (int) row[1];

            if (year > now.getYear() ||
                    (year == now.getYear() && month > now.getMonthValue())) {
                continue;
            }

            Map<String, Object> map = new HashMap<>();
            map.put("month", month);
            map.put("year", year);

            result.add(map);
        }

        return result;
    }

    // ======================================================
    // 🔥 PAYROLL CHART
    // ======================================================
    public List<Object[]> getMonthlyPayrollSummary(int year) {
        return salaryRepo.getMonthlyPayrollSummary(year);
    }

    // ======================================================
    // 🔥 DTO MAPPING
    // ======================================================
    private SalaryResponse mapToDTO(Salary s) {

        return new SalaryResponse(
                s.getId(),
                s.getUser().getId(),
                s.getUser().getFirstName() + " " + s.getUser().getLastName(),
                s.getBasic(),
                s.getAllowances(),
                s.getPf(),
                s.getTax(),
                s.getLeaveDeduction(),
                s.getDeductions(),
                s.getNetSalary(),
                s.getUnpaidLeaveDays(),
                s.getAbsentDays(),
                s.getMonth(),
                s.getYear(),
                s.getStatus().name()
        );
    }
}
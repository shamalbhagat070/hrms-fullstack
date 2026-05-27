package com.hrms.controllers;

import com.hrms.dto.response.SalaryResponse;
import com.hrms.services.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Month;
import java.util.*;

@RestController
@RequestMapping("/api/salary")
@CrossOrigin
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService service;

    // ✅ Generate Salary (Admin)
    @PostMapping("/generate")
    public ResponseEntity<String> generate(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(required = false) String search) {

        service.generateSalary(month, year, search);
        return ResponseEntity.ok("Salary Generated ✅");
    }

    // ✅ Get Salary (Admin List)
    @GetMapping
    public ResponseEntity<Page<SalaryResponse>> getSalary(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(
                service.getSalary(month, year, page, size, search)
        );
    }

    // ✅ Monthly Payroll Chart
    @GetMapping("/monthly")
    public ResponseEntity<Map<String, Double>> getMonthlyPayroll(
            @RequestParam int year) {

        List<Object[]> result = service.getMonthlyPayrollSummary(year);

        Map<String, Double> map = new LinkedHashMap<>();

        String[] months = {"Jan","Feb","Mar","Apr","May","Jun",
                "Jul","Aug","Sep","Oct","Nov","Dec"};

        for (String m : months) {
            map.put(m, 0.0);
        }

        for (Object[] row : result) {

            Integer month = (Integer) row[0];
            Double total = (Double) row[1];

            if (total == null) total = 0.0;

            String monthName = Month.of(month)
                    .name()
                    .substring(0,1) +
                    Month.of(month).name().substring(1,3).toLowerCase();

            map.put(monthName, total);
        }

        return ResponseEntity.ok(map);
    }

    // ✅ Employee Salary (Self)
    @GetMapping("/my")
    public ResponseEntity<List<SalaryResponse>> mySalary(
            Authentication auth,
            @RequestParam int month,
            @RequestParam int year) {

        return ResponseEntity.ok(
                service.getMySalary(auth.getName(), month, year)
        );
    }

    // ✅ Download Payslip PDF
    @GetMapping("/payslip/{id}")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long id) {

        byte[] pdf = service.generatePayslip(id);

        System.out.println("PDF SIZE: " + (pdf != null ? pdf.length : 0));

        if (pdf == null || pdf.length == 0) {
            throw new RuntimeException("PDF is empty ❌");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=payslip_" + id + ".pdf")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(pdf.length)) // ✅ added
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/months")
    public ResponseEntity<?> getAvailableMonths(Authentication auth) {
        return ResponseEntity.ok(
                service.getAvailableMonths(auth.getName())
        );
    }
}
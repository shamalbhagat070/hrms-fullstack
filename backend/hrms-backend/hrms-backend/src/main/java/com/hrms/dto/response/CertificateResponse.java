package com.hrms.dto.response;

import java.time.LocalDate;

public class CertificateResponse {

    private String name;
    private String role;
    private String company;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean completed;

    public CertificateResponse(String name, String role, String company,
                               LocalDate startDate, LocalDate endDate, boolean completed) {
        this.name = name;
        this.role = role;
        this.company = company;
        this.startDate = startDate;
        this.endDate = endDate;
        this.completed = completed;
    }

    public String getName() { return name; }
    public String getRole() { return role; }
    public String getCompany() { return company; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public boolean isCompleted() { return completed; }
}
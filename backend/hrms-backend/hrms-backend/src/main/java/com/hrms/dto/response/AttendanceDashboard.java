package com.hrms.dto.response;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceDashboard {
    private long present;
    private long absent;
    private long leave;
}
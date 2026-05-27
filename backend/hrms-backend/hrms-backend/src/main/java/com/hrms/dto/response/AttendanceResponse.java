package com.hrms.dto.response;

import lombok.*;
import java.time.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private LocalDate date;
    private String status;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}
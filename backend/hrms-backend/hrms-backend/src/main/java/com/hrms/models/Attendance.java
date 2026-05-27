package com.hrms.models;

import com.hrms.enums.Status;   // ✅ IMPORTANT
import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;

    @Enumerated(EnumType.STRING)   // ✅ stores "PRESENT", "ABSENT"
    private Status status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
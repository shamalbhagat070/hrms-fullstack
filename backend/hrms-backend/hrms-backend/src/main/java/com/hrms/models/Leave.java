package com.hrms.models;

import com.hrms.enums.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "leaves")
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private LeaveType leaveType;

    private LocalDate startDate;
    private LocalDate endDate;

    private String reason;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;


    @Column(name = "half_day", nullable = false)
    @Enumerated(EnumType.STRING)
    private HalfDayType halfDayType = HalfDayType.FULL_DAY;

    private LocalDate appliedDate;
    private LocalDate approvedDate;

    private String approvedBy;

}
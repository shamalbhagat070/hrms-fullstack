package com.hrms.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private int casualLeave;
    private int sickLeave;
    private int paidLeave;
}
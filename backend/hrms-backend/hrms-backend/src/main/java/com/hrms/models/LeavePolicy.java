package com.hrms.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class LeavePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int casualPerMonth;
    private int sickPerMonth;
    private int paidPerMonth;

    private int maxCarryForward;

    private boolean halfDayAllowed;

    private int probationMonths;

    private String applicableRole;
}
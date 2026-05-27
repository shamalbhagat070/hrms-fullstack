package com.hrms.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hrms.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email"),
                @UniqueConstraint(columnNames = "username")
        }
)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* Personal Info */
    private String firstName;
    private String lastName;

    /* Contact */
    @Email
    private String email;
    private String mobileNumber;
    private String address;

    /* Salary */
    private double salary;

    /* Login */
    @NotBlank
    @Size(max = 20)
    private String username;

    @NotBlank
    @Size(max = 120)
    private String password;

    /* ✅ ROLE (FIXED) */
    @Enumerated(EnumType.STRING)
    private Role role;

    /* HR Info */
    private String department;
    private String designation;
    private String status;

    /* Dates */
    private LocalDate joiningDate;
    private LocalDate dob;

    @PrePersist
    public void prePersist() {
        if (this.joiningDate == null) {
            this.joiningDate = LocalDate.now();
        }
    }

    /* Password Reset */
    private Integer otp;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    /* Leave Policy */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id")
    private LeavePolicy leavePolicy;

    /* Personal */
    private String gender;
    private String city;
    private String state;
    private String country;
    private String pincode;

    private String employmentType;

    /* Bank */
    private String bankName;
    private String accountNumber;
    private String ifsc;

    /* Profile */
    @Column(name = "profile_image")
    private String profileImage;

    /* =========================
       TASK RELATIONSHIP
    ========================= */

    // 👨‍🎓 Tasks assigned TO this user (intern)
    @OneToMany(mappedBy = "intern", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<InternTask> assignedTasks;

    // 👨‍💼 Tasks created BY this user (admin)
    @OneToMany(mappedBy = "createdBy", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<InternTask> createdTasks;
}
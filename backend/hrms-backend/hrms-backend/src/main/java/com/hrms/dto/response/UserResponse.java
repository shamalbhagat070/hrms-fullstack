package com.hrms.dto.response;

import com.hrms.models.User;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private LocalDate dob;
    private String gender;

    private String department;
    private String designation;
    private String employmentType;
    private LocalDate joiningDate;

    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;

    private String bankName;
    private String accountNumber;
    private String ifsc;

    private String username;
    private String role;   // ENUM → String
    private String status;

    private double salary;
    private String profileImage;

    // =========================
    // CONSTRUCTOR
    // =========================
    public UserResponse(User user) {

        this.id = user.getId();

        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.mobileNumber = user.getMobileNumber();
        this.dob = user.getDob();
        this.gender = user.getGender();

        this.department = user.getDepartment();
        this.designation = user.getDesignation();
        this.employmentType = user.getEmploymentType();
        this.joiningDate = user.getJoiningDate();

        this.address = user.getAddress();
        this.city = user.getCity();
        this.state = user.getState();
        this.country = user.getCountry();
        this.pincode = user.getPincode();

        this.bankName = user.getBankName();
        this.accountNumber = user.getAccountNumber();
        this.ifsc = user.getIfsc();

        this.username = user.getUsername();

        // ✅ FIX ENUM → STRING
        this.role = user.getRole().name();

        this.status = user.getStatus();

        this.salary = user.getSalary();
        this.profileImage = user.getProfileImage();
    }
}
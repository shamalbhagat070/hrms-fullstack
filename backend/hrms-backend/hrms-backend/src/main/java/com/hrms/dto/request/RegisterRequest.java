package com.hrms.dto.request;

import lombok.Data;

@Data

public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String username;
    private String password;
    private String role;
    private String address;
    private String department;
    private String designation;
    private double salary;
    private String status;
    private Integer otp;

}
package com.hrms.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserRequest {

        private String firstName;
        private String lastName;
        private String email;
        private String mobileNumber;
        private LocalDate dob;
        private String gender;

        private String department;
        private String designation;
        private String employmentType;

        private String address;
        private String city;
        private String state;
        private String country;
        private String pincode;

        private String bankName;
        private String accountNumber;
        private String ifsc;
        private String username;
        private String role;
        private String status;
        private String password;
        private LocalDate joiningDate;
}

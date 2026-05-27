package com.hrms.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private boolean success;
    private String message;
    private String username;
    private String role;
    private String token;
}

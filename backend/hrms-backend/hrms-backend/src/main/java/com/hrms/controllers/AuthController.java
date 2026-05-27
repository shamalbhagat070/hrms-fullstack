package com.hrms.controllers;

import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.request.RegisterRequest;
import com.hrms.dto.response.LoginResponse;
import com.hrms.dto.response.OtpResponse;

import com.hrms.dto.response.PasswordResetResponse;
import com.hrms.dto.response.RegisterResponse;
import com.hrms.services.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;


    /* REGISTER */

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request){
        return authService.register(request);
    }


    /* LOGIN */

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){
        return authService.login(request);
    }


    /* FORGOT PASSWORD */

    @PostMapping("/forgot-password")
    public OtpResponse forgotPassword(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        if(email == null || email.trim().isEmpty()){
            return new OtpResponse(false,"Email is required",null);
        }

        return authService.forgotPassword(email.trim());
    }


    /* RESET PASSWORD */

    @PostMapping("/reset-password")
    public PasswordResetResponse resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if(token == null || token.isEmpty()){
            return new PasswordResetResponse(false,"Invalid reset token");
        }

        if(newPassword == null || newPassword.length() < 6){
            return new PasswordResetResponse(false,"Password must be at least 6 characters");
        }

        return authService.resetPassword(token, newPassword);
    }
}
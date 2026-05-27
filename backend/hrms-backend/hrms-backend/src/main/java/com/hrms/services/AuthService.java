package com.hrms.services;

import com.hrms.dto.request.RegisterRequest;
import com.hrms.dto.request.LoginRequest;
import com.hrms.dto.response.LoginResponse;
import com.hrms.dto.response.OtpResponse;
import com.hrms.dto.response.PasswordResetResponse;
import com.hrms.dto.response.RegisterResponse;
import com.hrms.enums.Role;
import com.hrms.models.User;
import com.hrms.repository.UserRepository;
import com.hrms.security.JwtUtil;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // Token expiry time
    private static final int TOKEN_EXPIRY_MINUTES = 15;



    /* REGISTER */

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponse(false, "Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return new RegisterResponse(false, "Username already exists");
        }

        if (userRepository.existsByMobileNumber(request.getMobileNumber())) {
            return new RegisterResponse(false, "Mobile number already registered");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobileNumber(request.getMobileNumber());
        user.setUsername(request.getUsername());

        // 🔐 PASSWORD ENCODE
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // ✅ FIX ROLE (ENUM)
        user.setRole(
                request.getRole() != null
                        ? parseRole(request.getRole())
                        : Role.EMPLOYEE
        );

        user.setAddress(request.getAddress());
        user.setDepartment(request.getDepartment());
        user.setDesignation(request.getDesignation());
        user.setSalary(request.getSalary());
        user.setStatus("ACTIVE");

        userRepository.save(user);

        return new RegisterResponse(true, "User registered successfully");
    }


    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    /* LOGIN */

    public LoginResponse login(LoginRequest request){

        Optional<User> userOptional =
                userRepository.findByUsername(request.getUsername());

        if(userOptional.isEmpty()){
            return new LoginResponse(false,"User not found",null,null,null);
        }

        User user = userOptional.get();

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return new LoginResponse(false,"Invalid password",null,null,null);
        }

        // 🔥 GENERATE TOKEN
        String token = jwtUtil.generateToken(user.getUsername());

        return new LoginResponse(
                true,
                "Login successful",
                user.getUsername(),
                user.getRole().name(), // ✅ FIXED
                token
        );
    }


    /* FORGOT PASSWORD */

    public OtpResponse forgotPassword(String email) {

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return new OtpResponse(false, "User not found", null);
        }

        User user = userOptional.get();

        // Generate reset token
        String token = UUID.randomUUID().toString();

        // Expiry time
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

        user.setResetToken(token);
        user.setTokenExpiry(expiry);

        userRepository.save(user);

        // Reset link


        String frontendUrl = "http://localhost:5500/reset-password.html";
        String resetLink = frontendUrl + "?token=" + token;

        System.out.println("RESET LINK: " + resetLink); // 👈 ADD THIS

        String html =
                "<h3>Password Reset Request</h3>"
                        + "<p>Click the link below to reset your password:</p>"
                        + "<a href='" + resetLink + "'>Reset Password</a>"
                        + "<p>This link will expire in 15 minutes.</p>";

        try {
            emailService.sendEmail(user.getEmail(), "HRMS Password Reset", html);
        } catch (MessagingException e) {
            return new OtpResponse(false, "Failed to send email", null);
        }

        return new OtpResponse(true, "Password reset link sent successfully", null);
    }



    /* RESET PASSWORD */

    public PasswordResetResponse resetPassword(String token, String newPassword) {

        Optional<User> userOptional = userRepository.findByResetToken(token);

        if (userOptional.isEmpty()) {
            return new PasswordResetResponse(false, "Invalid or expired token");
        }

        User user = userOptional.get();

        // Check expiry
        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            return new PasswordResetResponse(false, "Reset link expired");
        }

        // Prevent same password
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            return new PasswordResetResponse(false, "New password cannot be same as old password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));

        // Clear token
        user.setResetToken(null);
        user.setTokenExpiry(null);

        userRepository.save(user);

        return new PasswordResetResponse(true, "Password reset successful");
    }

}
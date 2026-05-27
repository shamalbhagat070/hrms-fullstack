package com.hrms.controllers;

import com.hrms.dto.request.UserRequest;
import com.hrms.dto.response.UserResponse;
import com.hrms.models.User;
import com.hrms.repository.UserRepository;
import com.hrms.security.JwtUtil;
import com.hrms.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {


    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    /* ===============================
       CREATE USER
    ============================== */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    /* ===============================
       GET ALL USERS
    ============================== */
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /* ===============================
       GET USER BY ID
    ============================== */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /* ===============================
       UPDATE USER
    ============================== */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UserRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    /* ===============================
       DELETE USER
    ============================== */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    /* ===============================
       GET CURRENT USER PROFILE
    ============================== */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getMyProfile(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);

        // 🔥 extract username from JWT
        String username = jwtUtil.extractUsername(token);

        User user = userService.findByUsername(username);

        return ResponseEntity.ok(new UserResponse(user));
    }

    /* ===============================
       UPDATE CURRENT USER PROFILE
    ============================== */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateMyProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserRequest request) {

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        return ResponseEntity.ok(
                userService.updateProfileByUsername(username, request)
        );
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication auth,
            @RequestBody Map<String, String> request) {

        if (auth == null || auth.getName() == null) {
            return ResponseEntity.status(401).body("Unauthorized ❌");
        }

        String username = auth.getName();

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        return userService.changePassword(username, currentPassword, newPassword);
    }

    /* ===============================
       UPLOAD PROFILE IMAGE
    ============================== */


    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        User user = userService.findByUsername(username);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String originalName = file.getOriginalFilename();
        String cleanName = (originalName != null)
                ? originalName.replaceAll("[^a-zA-Z0-9\\.\\-]", "_")
                : "file";

        String fileName = System.currentTimeMillis() + "_" + cleanName;

        Path filePath = uploadDir.resolve(fileName);
        Files.write(filePath, file.getBytes(), StandardOpenOption.CREATE);

        user.setProfileImage(fileName);
        userRepository.save(user);

        return ResponseEntity.ok(fileName);
    }

    /* ===============================
       REMOVE PROFILE IMAGE
    ============================== */
    @DeleteMapping("/remove-image")
    public ResponseEntity<?> removeImage(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        userService.removeProfileImage(username);

        return ResponseEntity.ok("Removed");
    }

    @GetMapping("/certificate/download")
    public ResponseEntity<?> downloadCertificate(
            @RequestHeader("Authorization") String authHeader) {

        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            byte[] pdf = userService.generateCertificatePdf(username);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=certificate.pdf")
                    .body(pdf);

        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Something went wrong");
        }
    }
}
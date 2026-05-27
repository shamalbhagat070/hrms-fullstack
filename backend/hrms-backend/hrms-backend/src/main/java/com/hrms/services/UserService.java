package com.hrms.services;

import com.hrms.enums.Role;
import com.hrms.models.User;
import com.hrms.repository.UserRepository;
import com.hrms.dto.request.UserRequest;
import com.hrms.dto.response.UserResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.*;
import com.itextpdf.layout.borders.*;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /* ===============================
       CREATE USER
    ============================== */
    public UserResponse createUser(UserRequest request) {

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());

        // 🔐 ENCODE PASSWORD (VERY IMPORTANT)
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setDepartment(request.getDepartment());
        user.setDesignation(request.getDesignation());
        user.setMobileNumber(request.getMobileNumber());
        user.setAddress(request.getAddress());

        // ✅ FIX ROLE
        user.setRole(parseRole(request.getRole()));

        user.setStatus(request.getStatus());

        return new UserResponse(userRepository.save(user));
    }



    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    /* ===============================
       GET ALL USERS
    ============================== */
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    /* ===============================
       GET USER BY ID
    ============================== */
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(user);
    }

    /* ===============================
       UPDATE USER (ADMIN)
    ============================== */
    public UserResponse updateUser(Long id, UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setDepartment(request.getDepartment());
        user.setDesignation(request.getDesignation());
        user.setMobileNumber(request.getMobileNumber());
        user.setAddress(request.getAddress());

        // ✅ FIX ROLE
        if (request.getRole() != null) {
            user.setRole(parseRole(request.getRole()));
        }

        user.setStatus(request.getStatus());

        return new UserResponse(userRepository.save(user));
    }
    /* ===============================
       DELETE USER
    ============================== */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }


    /* ===============================
       UPDATE PROFILE (SELF)
    ============================== */
    public UserResponse updateProfileByUsername(String username, UserRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        /* ================= BASIC ================= */
        if (request.getFirstName() != null)
            user.setFirstName(request.getFirstName());

        if (request.getLastName() != null)
            user.setLastName(request.getLastName());

        if (request.getEmail() != null)
            user.setEmail(request.getEmail());

        if (request.getMobileNumber() != null)
            user.setMobileNumber(request.getMobileNumber());

        if (request.getDob() != null)
            user.setDob(request.getDob());

        if (request.getGender() != null)
            user.setGender(request.getGender());

        /* ================= JOB ================= */
        if (request.getDepartment() != null)
            user.setDepartment(request.getDepartment());

        if (request.getDesignation() != null)
            user.setDesignation(request.getDesignation());

        if (request.getEmploymentType() != null)
            user.setEmploymentType(request.getEmploymentType());

        // joiningDate usually not editable by employee (optional)
        // user.setJoiningDate(request.getJoiningDate());

        /* ================= ADDRESS ================= */
        if (request.getAddress() != null)
            user.setAddress(request.getAddress());

        if (request.getCity() != null)
            user.setCity(request.getCity());

        if (request.getState() != null)
            user.setState(request.getState());

        if (request.getCountry() != null)
            user.setCountry(request.getCountry());

        if (request.getPincode() != null)
            user.setPincode(request.getPincode());

        /* ================= BANK ================= */
        if (request.getBankName() != null)
            user.setBankName(request.getBankName());

        if (request.getAccountNumber() != null)
            user.setAccountNumber(request.getAccountNumber());

        if (request.getIfsc() != null)
            user.setIfsc(request.getIfsc());

        /* ================= SAVE ================= */
        User updatedUser = userRepository.save(user);

        return new UserResponse(updatedUser);
    }



    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void updateProfileImage(String username, String fileName) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfileImage(fileName);

        userRepository.save(user);
    }

    public void removeProfileImage(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String oldFile = user.getProfileImage();

        if (oldFile != null) {
            Path filePath = Paths.get("uploads").resolve(oldFile);
            try {
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                System.out.println("File delete failed: " + e.getMessage());
            }
        }

        user.setProfileImage(null);
        userRepository.save(user);
    }

    public User findByUsername(String username) {

        if (username == null || username.isEmpty()) {
            throw new RuntimeException("Username cannot be null or empty");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found with username: " + username)
                );
    }


    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public ResponseEntity<?> changePassword(String username, String currentPassword, String newPassword) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found ❌"));

        // ✅ check current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect ❌");
        }

        // ✅ update new password
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully ✅");
    }

    public byte[] generateCertificatePdf(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String name = user.getFirstName() + " " + user.getLastName();
        String role = user.getDesignation() != null ? user.getDesignation() : "Intern";

        LocalDate startDate = user.getJoiningDate();
        LocalDate endDate = startDate != null ? startDate.plusMonths(3) : LocalDate.now();

        // 🔐 Restrict if not completed
        if (!LocalDate.now().isAfter(endDate)) {
            throw new IllegalStateException("Certificate available after internship completion");        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);

            document.setMargins(40, 40, 40, 40);

            // OUTER BORDER
            Table border = new Table(1).useAllAvailableWidth();
            border.setBorder(new SolidBorder(ColorConstants.BLUE, 4));

            Cell cell = new Cell().setBorder(Border.NO_BORDER).setPadding(30);

            // INNER BORDER
            Table inner = new Table(1).useAllAvailableWidth();
            inner.setBorder(new SolidBorder(ColorConstants.GRAY, 1));

            Cell content = new Cell().setBorder(Border.NO_BORDER).setPadding(30);

            // TITLE
            content.add(new Paragraph("CERTIFICATE OF COMPLETION")
                    .setBold()
                    .setFontSize(22)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            // BODY
            content.add(new Paragraph("This is to certify that")
                    .setTextAlignment(TextAlignment.CENTER));

            content.add(new Paragraph(name)
                    .setBold()
                    .setFontSize(20)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(10)
                    .setMarginBottom(10));

            content.add(new Paragraph("has successfully completed internship as")
                    .setTextAlignment(TextAlignment.CENTER));

            content.add(new Paragraph(role)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            content.add(new Paragraph("at HRMS Pvt Ltd")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10));

            content.add(new Paragraph(
                    "From " + (startDate != null ? startDate.format(formatter) : "-")
                            + " to " + endDate.format(formatter))
                    .setTextAlignment(TextAlignment.CENTER));

            content.add(new Paragraph("\nWe appreciate your dedication and contribution.")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(20));

            // SIGNATURE SECTION
            Table signTable = new Table(2).useAllAvailableWidth();
            signTable.setMarginTop(40);

            signTable.addCell(createSignCell("HR Manager"));
            signTable.addCell(createSignCell("Director"));

            content.add(signTable);

            // SEAL
            content.add(new Paragraph("APPROVED")
                    .setFontSize(10)
                    .setBold()
                    .setFontColor(ColorConstants.BLUE)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(10));

            inner.addCell(content);
            cell.add(inner);
            border.addCell(cell);

            document.add(border);

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed", e);
        }

        return out.toByteArray();
    }

    /* SIGNATURE HELPER */
    private Cell createSignCell(String title) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.CENTER)
                .add(new Paragraph("\n\n__________________"))
                .add(new Paragraph(title).setFontSize(10));
    }
}
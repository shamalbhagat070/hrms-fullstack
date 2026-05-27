package com.hrms.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hrms.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDate deadline;

    @Enumerated(EnumType.STRING) // ✅ FIXED
    private TaskStatus status;

    private String filePath;

    // 👨‍🎓 Assigned Intern
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intern_id")
    @JsonIgnoreProperties({"assignedTasks", "createdTasks"})
    private User intern;

    // 👨‍💼 Created By Admin
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"assignedTasks", "createdTasks"})
    private User createdBy;
}
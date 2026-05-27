package com.hrms.controllers;

import com.hrms.models.InternTask;
import com.hrms.services.InternTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/intern/tasks")
@CrossOrigin
public class InternTaskController {

    @Autowired
    private InternTaskService service;

    // =========================
    // 👨‍🎓 INTERN - VIEW TASKS
    // =========================
    @GetMapping("/my")
    public List<InternTask> getMyTasks(Authentication auth) {
        return service.getMyTasks(auth.getName());
    }

    // =========================
    // 👨‍🎓 INTERN - SUBMIT TASK
    // =========================
    @PostMapping("/submit")
    public String submitTask(@RequestParam Long taskId,
                             @RequestParam MultipartFile file,
                             Authentication auth) {

        try {
            // 📁 Save file locally
            String uploadDir = "uploads/";
            File folder = new File(uploadDir);
            if (!folder.exists()) folder.mkdirs();

            String filePath = uploadDir + file.getOriginalFilename();
            file.transferTo(new File(filePath));

            return service.submitTask(
                    taskId,
                    filePath,
                    auth.getName()
            );

        } catch (Exception e) {
            e.printStackTrace();
            return "File upload failed ❌";
        }
    }

    // =========================
    // 👨‍💼 ADMIN - REVIEW TASK
    // =========================
    @PutMapping("/review/{taskId}")
    public String reviewTask(@PathVariable Long taskId,
                             Authentication auth) {

        return service.reviewTask(taskId, auth.getName());
    }

    // =========================
    // 📊 DASHBOARD DATA
    // =========================
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication auth) {
        return service.getDashboard(auth.getName());
    }
}
package com.hrms.controllers;

import com.hrms.models.InternTask;
import com.hrms.services.InternTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tasks")
@CrossOrigin
public class AdminTaskController {

    @Autowired
    private InternTaskService service;

    // =========================
    // CREATE TASK (ADMIN)
    // =========================
    @PostMapping("/create")
    public String createTask(@RequestBody Map<String, String> req,
                             Authentication auth) {

        String title = req.get("title");
        String deadline = req.get("deadline");
        String internUsername = req.get("username");

        return service.createTask(
                title,
                deadline,
                internUsername,
                auth.getName()   // admin username from JWT
        );
    }

    @GetMapping("/all")
    public List<InternTask> getAllTasks() {
        return service.getAllTasks();
    }

    @DeleteMapping("/delete/{id}")
    public String deleteTask(@PathVariable Long id) {

        service.deleteTask(id);

        return "Task deleted successfully";
    }

    @PutMapping("/review/{id}")
    public String reviewTask(@PathVariable Long id,
                             Authentication auth) {

        return service.reviewTask(id, auth.getName());
    }


}
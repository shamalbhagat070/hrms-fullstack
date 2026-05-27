package com.hrms.services;

import com.hrms.enums.Role;
import com.hrms.enums.TaskStatus;
import com.hrms.models.InternTask;
import com.hrms.models.User;
import com.hrms.repository.InternTaskRepository;
import com.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

@Service
public class InternTaskService {

    @Autowired
    private InternTaskRepository taskRepo;

    @Autowired
    private UserRepository userRepo;

    // =========================
    // CREATE TASK (ADMIN)
    // =========================
    public String createTask(String title, String deadline, String internUsername, String adminUsername) {

        // 🔹 Validate input
        if (title == null || title.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");

        if (deadline == null || deadline.isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deadline is required");

        // 🔹 Fetch users
        User admin = userRepo.findByUsername(adminUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        User intern = userRepo.findByUsername(internUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intern not found"));

        // 🔹 Role validation
        if (admin.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create task");
        }

        if (intern.getRole() != Role.INTERN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid intern user");
        }

        // 🔹 Create task
        InternTask task = new InternTask();
        task.setTitle(title);
        task.setDeadline(LocalDate.parse(deadline));
        task.setStatus(TaskStatus.PENDING);

        task.setIntern(intern);
        task.setCreatedBy(admin);

        taskRepo.save(task);

        return "Task created successfully";
    }

    // =========================
    // GET INTERN TASKS
    // =========================
    public List<InternTask> getMyTasks(String username) {

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.INTERN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only interns can view tasks");
        }

        return taskRepo.findByInternUsername(username);
    }

    // =========================
    // SUBMIT TASK (INTERN)
    // =========================
    public String submitTask(Long taskId, String filePath, String username) {

        InternTask task = taskRepo.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        // 🔹 Authorization check
        if (!task.getIntern().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }

        task.setFilePath(filePath);
        task.setStatus(TaskStatus.SUBMITTED);

        taskRepo.save(task);

        return "Task submitted successfully";
    }


    // =========================
    // DASHBOARD DATA
    // =========================
    public Map<String, Object> getDashboard(String username) {

        List<InternTask> tasks = taskRepo.findByInternUsername(username);

        int total = tasks.size();

        int completed = (int) tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.REVIEWED)
                .count();

        int pending = total - completed;

        int progress = total == 0 ? 0 : (completed * 100 / total);

        Map<String, Object> res = new HashMap<>();
        res.put("assigned", total);
        res.put("completed", completed);
        res.put("pending", pending);
        res.put("progress", progress);

        return res;
    }

    public List<InternTask> getAllTasks() {
        return taskRepo.findAll();
    }


    public void deleteTask(Long id) {

        InternTask task = taskRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        taskRepo.delete(task);
    }

    public String reviewTask(Long taskId, String adminUsername) {

        User admin = userRepo.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only admin can review task");
        }

        InternTask task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setStatus(TaskStatus.REVIEWED);

        taskRepo.save(task);

        return "Task reviewed successfully";
    }

}
package com.library.management.controller;

import com.library.management.dto.AdminDashboardStatsResponse;
import com.library.management.dto.CreateLibrarianRequest;
import com.library.management.dto.UpdateUserStatusRequest;
import com.library.management.dto.UserResponse;
import com.library.management.model.Role;
import com.library.management.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminService adminService;

    public AdminDashboardController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        AdminDashboardStatsResponse stats = adminService.getDashboardStats();
        Map<String, Object> data = new HashMap<>();
        data.put("role", "ADMIN");
        data.put("status", "ACTIVE");
        data.put("message", "Welcome to the Admin Dashboard");
        data.put("stats", stats);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminDashboardStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers(@RequestParam(required = false) Role role) {
        return ResponseEntity.ok(adminService.getUsers(role));
    }

    @PostMapping("/librarians")
    public ResponseEntity<UserResponse> createLibrarian(@Valid @RequestBody CreateLibrarianRequest request) {
        UserResponse response = adminService.createLibrarian(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        UserResponse response = adminService.updateUserStatus(id, request.getActive());
        return ResponseEntity.ok(response);
    }
}

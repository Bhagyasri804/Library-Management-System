package com.library.management.controller;

import com.library.management.dto.BookResponse;
import com.library.management.dto.BorrowRecordResponse;
import com.library.management.dto.MessageResponse;
import com.library.management.dto.ReservationResponse;
import com.library.management.dto.StudentDashboardStatsResponse;
import com.library.management.dto.StudentFineResponse;
import com.library.management.dto.UpdateStudentProfileRequest;
import com.library.management.dto.UserResponse;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.User;
import com.library.management.repository.UserRepository;
import com.library.management.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentDashboardController {

    private final StudentService studentService;
    private final UserRepository userRepository;

    public StudentDashboardController(StudentService studentService, UserRepository userRepository) {
        this.studentService = studentService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated student found in session");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated student not found: " + authentication.getName()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<StudentDashboardStatsResponse> getDashboard() {
        User student = getAuthenticatedStudent();
        StudentDashboardStatsResponse stats = studentService.getDashboardStats(student);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> getBooksCatalog(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId) {
        List<BookResponse> books = studentService.getBooksCatalog(search, categoryId);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/borrowed-books")
    public ResponseEntity<List<BorrowRecordResponse>> getMyBorrowedBooks() {
        User student = getAuthenticatedStudent();
        List<BorrowRecordResponse> records = studentService.getStudentBorrowedBooks(student);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<ReservationResponse>> getMyReservations() {
        User student = getAuthenticatedStudent();
        List<ReservationResponse> reservations = studentService.getStudentReservations(student);
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/reservations/{bookId}")
    public ResponseEntity<ReservationResponse> reserveBook(@PathVariable Long bookId) {
        User student = getAuthenticatedStudent();
        ReservationResponse response = studentService.reserveBook(student, bookId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/reservations/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservationPost(@PathVariable Long id) {
        User student = getAuthenticatedStudent();
        ReservationResponse response = studentService.cancelReservation(student, id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<ReservationResponse> cancelReservationDelete(@PathVariable Long id) {
        User student = getAuthenticatedStudent();
        ReservationResponse response = studentService.cancelReservation(student, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/fines")
    public ResponseEntity<List<StudentFineResponse>> getMyFines() {
        User student = getAuthenticatedStudent();
        List<StudentFineResponse> fines = studentService.getStudentFines(student);
        return ResponseEntity.ok(fines);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile() {
        User student = getAuthenticatedStudent();
        UserResponse response = studentService.getProfile(student);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateStudentProfileRequest request) {
        User student = getAuthenticatedStudent();
        UserResponse response = studentService.updateProfile(student, request);
        return ResponseEntity.ok(response);
    }
}

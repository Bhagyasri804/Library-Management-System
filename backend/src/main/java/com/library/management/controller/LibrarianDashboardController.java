package com.library.management.controller;

import com.library.management.dto.BookResponse;
import com.library.management.dto.BorrowRecordResponse;
import com.library.management.dto.CreateStudentRequest;
import com.library.management.dto.IssueBookRequest;
import com.library.management.dto.LibrarianDashboardStatsResponse;
import com.library.management.dto.UserResponse;
import com.library.management.service.BookService;
import com.library.management.service.LibrarianService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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
@RequestMapping("/api/librarian")
@PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
public class LibrarianDashboardController {

    private final LibrarianService librarianService;
    private final BookService bookService;

    public LibrarianDashboardController(LibrarianService librarianService, BookService bookService) {
        this.librarianService = librarianService;
        this.bookService = bookService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getLibrarianDashboard() {
        LibrarianDashboardStatsResponse stats = librarianService.getStats();
        Map<String, Object> data = new HashMap<>();
        data.put("role", "LIBRARIAN");
        data.put("status", "ACTIVE");
        data.put("message", "Welcome to the Librarian Dashboard");
        data.put("stats", stats);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/stats")
    public ResponseEntity<LibrarianDashboardStatsResponse> getStats() {
        return ResponseEntity.ok(librarianService.getStats());
    }

    @GetMapping("/students")
    public ResponseEntity<List<UserResponse>> getStudents(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(librarianService.getStudents(search));
    }

    @PostMapping("/students")
    public ResponseEntity<UserResponse> registerStudent(@Valid @RequestBody CreateStudentRequest request) {
        UserResponse response = librarianService.registerStudent(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> getBooks(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(bookService.getAllBooks(search));
    }

    @PostMapping("/issue")
    public ResponseEntity<BorrowRecordResponse> issueBook(@Valid @RequestBody IssueBookRequest request) {
        BorrowRecordResponse response = librarianService.issueBook(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/issued-books")
    public ResponseEntity<List<BorrowRecordResponse>> getIssuedBooks(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(librarianService.getIssuedBooks(search));
    }

    @PostMapping("/return/{id}")
    public ResponseEntity<BorrowRecordResponse> returnBook(@PathVariable Long id) {
        BorrowRecordResponse response = librarianService.returnBook(id);
        return ResponseEntity.ok(response);
    }
}

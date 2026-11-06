package com.library.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class IssueBookRequest {

    @NotNull(message = "Book ID is required")
    private Long bookId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private LocalDate dueDate;

    @Min(value = 1, message = "Borrow days must be at least 1")
    private Integer borrowDays = 14;

    public IssueBookRequest() {
    }

    public IssueBookRequest(Long bookId, Long studentId, Integer borrowDays) {
        this.bookId = bookId;
        this.studentId = studentId;
        this.borrowDays = borrowDays != null ? borrowDays : 14;
    }

    public IssueBookRequest(Long bookId, Long studentId, LocalDate dueDate) {
        this.bookId = bookId;
        this.studentId = studentId;
        this.dueDate = dueDate;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getBorrowDays() {
        return borrowDays;
    }

    public void setBorrowDays(Integer borrowDays) {
        this.borrowDays = borrowDays;
    }
}

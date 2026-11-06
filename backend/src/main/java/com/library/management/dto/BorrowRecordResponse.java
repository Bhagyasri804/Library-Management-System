package com.library.management.dto;

import com.library.management.model.BorrowRecord;
import com.library.management.model.BorrowStatus;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class BorrowRecordResponse {

    private static final double DAILY_FINE_RATE = 2.0; // $2.00 per day overdue

    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentPhone;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private BorrowStatus status;
    private double fineAmount;
    private boolean isOverdue;
    private long overdueDays;

    public BorrowRecordResponse() {
    }

    public static BorrowRecordResponse fromEntity(BorrowRecord record) {
        if (record == null) return null;

        BorrowRecordResponse res = new BorrowRecordResponse();
        res.setId(record.getId());

        if (record.getBook() != null) {
            res.setBookId(record.getBook().getId());
            res.setBookTitle(record.getBook().getTitle());
            res.setBookAuthor(record.getBook().getAuthor());
            res.setBookIsbn(record.getBook().getIsbn());
        }

        if (record.getStudent() != null) {
            res.setStudentId(record.getStudent().getId());
            res.setStudentName(record.getStudent().getFullName());
            res.setStudentEmail(record.getStudent().getEmail());
            res.setStudentPhone(record.getStudent().getPhoneNumber());
        }

        res.setIssueDate(record.getIssueDate());
        res.setDueDate(record.getDueDate());
        res.setReturnDate(record.getReturnDate());
        res.setStatus(record.getStatus());

        LocalDate today = LocalDate.now();
        if (record.getStatus() == BorrowStatus.ISSUED && today.isAfter(record.getDueDate())) {
            res.setOverdue(true);
            res.setOverdueDays(ChronoUnit.DAYS.between(record.getDueDate(), today));
            res.setFineAmount(res.getOverdueDays() * DAILY_FINE_RATE);
        } else {
            res.setOverdue(false);
            res.setOverdueDays(0);
            res.setFineAmount(record.getFineAmount() != null ? record.getFineAmount() : 0.0);
        }

        return res;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public String getBookIsbn() {
        return bookIsbn;
    }

    public void setBookIsbn(String bookIsbn) {
        this.bookIsbn = bookIsbn;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getStudentPhone() {
        return studentPhone;
    }

    public void setStudentPhone(String studentPhone) {
        this.studentPhone = studentPhone;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDate returnDate) {
        this.returnDate = returnDate;
    }

    public BorrowStatus getStatus() {
        return status;
    }

    public void setStatus(BorrowStatus status) {
        this.status = status;
    }

    public double getFineAmount() {
        return fineAmount;
    }

    public void setFineAmount(double fineAmount) {
        this.fineAmount = fineAmount;
    }

    public boolean isOverdue() {
        return isOverdue;
    }

    public void setOverdue(boolean overdue) {
        isOverdue = overdue;
    }

    public long getOverdueDays() {
        return overdueDays;
    }

    public void setOverdueDays(long overdueDays) {
        this.overdueDays = overdueDays;
    }
}

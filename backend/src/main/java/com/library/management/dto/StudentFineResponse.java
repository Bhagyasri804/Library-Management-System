package com.library.management.dto;

import com.library.management.model.BorrowRecord;
import com.library.management.model.BorrowStatus;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class StudentFineResponse {

    private static final double DAILY_FINE_RATE = 2.0;

    private Long borrowRecordId;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private long overdueDays;
    private double fineAmount;
    private String status;
    private String reason;
    private BorrowStatus borrowStatus;

    public StudentFineResponse() {
    }

    public static StudentFineResponse fromRecord(BorrowRecord record) {
        if (record == null) return null;

        StudentFineResponse res = new StudentFineResponse();
        res.setBorrowRecordId(record.getId());
        res.setIssueDate(record.getIssueDate());
        res.setDueDate(record.getDueDate());
        res.setReturnDate(record.getReturnDate());
        res.setBorrowStatus(record.getStatus());

        if (record.getBook() != null) {
            res.setBookId(record.getBook().getId());
            res.setBookTitle(record.getBook().getTitle());
            res.setBookAuthor(record.getBook().getAuthor());
            res.setBookIsbn(record.getBook().getIsbn());
        }

        if (record.getStatus() == BorrowStatus.RETURNED) {
            double fine = record.getFineAmount() != null ? record.getFineAmount() : 0.0;
            res.setFineAmount(fine);
            if (record.getReturnDate() != null && record.getReturnDate().isAfter(record.getDueDate())) {
                long days = ChronoUnit.DAYS.between(record.getDueDate(), record.getReturnDate());
                res.setOverdueDays(days);
                res.setReason("Late return fine (" + days + " day" + (days > 1 ? "s" : "") + " overdue)");
            } else {
                res.setOverdueDays(0);
                res.setReason("Returned with fine");
            }
            res.setStatus("UNPAID");
        } else if (record.getStatus() == BorrowStatus.ISSUED && LocalDate.now().isAfter(record.getDueDate())) {
            long days = ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now());
            double fine = days * DAILY_FINE_RATE;
            res.setOverdueDays(days);
            res.setFineAmount(fine);
            res.setReason("Active loan overdue (" + days + " day" + (days > 1 ? "s" : "") + " past due date)");
            res.setStatus("UNPAID");
        } else {
            res.setFineAmount(0.0);
            res.setOverdueDays(0);
            res.setReason("No fine");
            res.setStatus("PAID");
        }

        return res;
    }

    public Long getBorrowRecordId() {
        return borrowRecordId;
    }

    public void setBorrowRecordId(Long borrowRecordId) {
        this.borrowRecordId = borrowRecordId;
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

    public long getOverdueDays() {
        return overdueDays;
    }

    public void setOverdueDays(long overdueDays) {
        this.overdueDays = overdueDays;
    }

    public double getFineAmount() {
        return fineAmount;
    }

    public void setFineAmount(double fineAmount) {
        this.fineAmount = fineAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public BorrowStatus getBorrowStatus() {
        return borrowStatus;
    }

    public void setBorrowStatus(BorrowStatus borrowStatus) {
        this.borrowStatus = borrowStatus;
    }
}

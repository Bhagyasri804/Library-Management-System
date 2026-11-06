package com.library.management.dto;

import com.library.management.model.Reservation;
import com.library.management.model.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReservationResponse {

    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDate reservationDate;
    private ReservationStatus status;
    private LocalDateTime createdAt;

    public ReservationResponse() {
    }

    public static ReservationResponse fromEntity(Reservation reservation) {
        if (reservation == null) return null;

        ReservationResponse res = new ReservationResponse();
        res.setId(reservation.getId());
        res.setReservationDate(reservation.getReservationDate());
        res.setStatus(reservation.getStatus());
        res.setCreatedAt(reservation.getCreatedAt());

        if (reservation.getBook() != null) {
            res.setBookId(reservation.getBook().getId());
            res.setBookTitle(reservation.getBook().getTitle());
            res.setBookAuthor(reservation.getBook().getAuthor());
            res.setBookIsbn(reservation.getBook().getIsbn());
        }

        if (reservation.getStudent() != null) {
            res.setStudentId(reservation.getStudent().getId());
            res.setStudentName(reservation.getStudent().getFullName());
            res.setStudentEmail(reservation.getStudent().getEmail());
        }

        return res;
    }

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

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

package com.library.management.dto;

public class LibrarianDashboardStatsResponse {

    private long totalBooks;
    private long availableBooks;
    private long issuedBooks;
    private long registeredStudents;

    public LibrarianDashboardStatsResponse() {
    }

    public LibrarianDashboardStatsResponse(long totalBooks, long availableBooks, long issuedBooks, long registeredStudents) {
        this.totalBooks = totalBooks;
        this.availableBooks = availableBooks;
        this.issuedBooks = issuedBooks;
        this.registeredStudents = registeredStudents;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getAvailableBooks() {
        return availableBooks;
    }

    public void setAvailableBooks(long availableBooks) {
        this.availableBooks = availableBooks;
    }

    public long getIssuedBooks() {
        return issuedBooks;
    }

    public void setIssuedBooks(long issuedBooks) {
        this.issuedBooks = issuedBooks;
    }

    public long getRegisteredStudents() {
        return registeredStudents;
    }

    public void setRegisteredStudents(long registeredStudents) {
        this.registeredStudents = registeredStudents;
    }
}

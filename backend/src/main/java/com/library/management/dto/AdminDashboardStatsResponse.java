package com.library.management.dto;

public class AdminDashboardStatsResponse {

    private long totalBooks;
    private long totalStudents;
    private long totalLibrarians;
    private long availableBooks;
    private long issuedBooks;
    private long totalCategories;

    public AdminDashboardStatsResponse() {
    }

    public AdminDashboardStatsResponse(long totalBooks, long totalStudents, long totalLibrarians, long availableBooks, long issuedBooks, long totalCategories) {
        this.totalBooks = totalBooks;
        this.totalStudents = totalStudents;
        this.totalLibrarians = totalLibrarians;
        this.availableBooks = availableBooks;
        this.issuedBooks = issuedBooks;
        this.totalCategories = totalCategories;
    }

    public long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalLibrarians() {
        return totalLibrarians;
    }

    public void setTotalLibrarians(long totalLibrarians) {
        this.totalLibrarians = totalLibrarians;
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

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }
}

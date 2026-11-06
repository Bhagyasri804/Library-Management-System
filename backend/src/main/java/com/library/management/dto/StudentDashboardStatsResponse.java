package com.library.management.dto;

public class StudentDashboardStatsResponse {

    private String role = "STUDENT";
    private String studentName;
    private String studentEmail;
    private long currentlyBorrowedCount;
    private long availableBooksCount;
    private long overdueBooksCount;
    private double outstandingFines;
    private long activeReservationsCount;

    public StudentDashboardStatsResponse() {
    }

    public StudentDashboardStatsResponse(String studentName, String studentEmail, long currentlyBorrowedCount,
                                         long availableBooksCount, long overdueBooksCount,
                                         double outstandingFines, long activeReservationsCount) {
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.currentlyBorrowedCount = currentlyBorrowedCount;
        this.availableBooksCount = availableBooksCount;
        this.overdueBooksCount = overdueBooksCount;
        this.outstandingFines = outstandingFines;
        this.activeReservationsCount = activeReservationsCount;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public long getCurrentlyBorrowedCount() {
        return currentlyBorrowedCount;
    }

    public void setCurrentlyBorrowedCount(long currentlyBorrowedCount) {
        this.currentlyBorrowedCount = currentlyBorrowedCount;
    }

    public long getAvailableBooksCount() {
        return availableBooksCount;
    }

    public void setAvailableBooksCount(long availableBooksCount) {
        this.availableBooksCount = availableBooksCount;
    }

    public long getOverdueBooksCount() {
        return overdueBooksCount;
    }

    public void setOverdueBooksCount(long overdueBooksCount) {
        this.overdueBooksCount = overdueBooksCount;
    }

    public double getOutstandingFines() {
        return outstandingFines;
    }

    public void setOutstandingFines(double outstandingFines) {
        this.outstandingFines = outstandingFines;
    }

    public long getActiveReservationsCount() {
        return activeReservationsCount;
    }

    public void setActiveReservationsCount(long activeReservationsCount) {
        this.activeReservationsCount = activeReservationsCount;
    }
}

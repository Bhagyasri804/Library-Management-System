package com.library.management.service;

import com.library.management.dto.BookResponse;
import com.library.management.dto.BorrowRecordResponse;
import com.library.management.dto.ReservationResponse;
import com.library.management.dto.StudentDashboardStatsResponse;
import com.library.management.dto.StudentFineResponse;
import com.library.management.dto.UpdateStudentProfileRequest;
import com.library.management.dto.UserResponse;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.Book;
import com.library.management.model.BorrowRecord;
import com.library.management.model.BorrowStatus;
import com.library.management.model.Reservation;
import com.library.management.model.ReservationStatus;
import com.library.management.model.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.ReservationRepository;
import com.library.management.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    private static final double DAILY_FINE_RATE = 2.0;

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public StudentService(BookRepository bookRepository,
                          BorrowRecordRepository borrowRecordRepository,
                          ReservationRepository reservationRepository,
                          UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public StudentDashboardStatsResponse getDashboardStats(User student) {
        List<BorrowRecord> studentRecords = borrowRecordRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());

        long currentlyBorrowedCount = studentRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.ISSUED)
                .count();

        long overdueBooksCount = studentRecords.stream()
                .filter(r -> r.getStatus() == BorrowStatus.ISSUED && LocalDate.now().isAfter(r.getDueDate()))
                .count();

        double totalFines = 0.0;
        for (BorrowRecord r : studentRecords) {
            if (r.getStatus() == BorrowStatus.RETURNED && r.getFineAmount() != null) {
                totalFines += r.getFineAmount();
            } else if (r.getStatus() == BorrowStatus.ISSUED && LocalDate.now().isAfter(r.getDueDate())) {
                long overdueDays = ChronoUnit.DAYS.between(r.getDueDate(), LocalDate.now());
                totalFines += (overdueDays * DAILY_FINE_RATE);
            }
        }

        long activeReservationsCount = reservationRepository.countByStudentIdAndStatus(student.getId(), ReservationStatus.PENDING);
        long availableBooksCount = bookRepository.sumAvailableCopies();

        return new StudentDashboardStatsResponse(
                student.getFullName(),
                student.getEmail(),
                currentlyBorrowedCount,
                availableBooksCount,
                overdueBooksCount,
                Math.round(totalFines * 100.0) / 100.0,
                activeReservationsCount
        );
    }

    @Transactional(readOnly = true)
    public List<BookResponse> getBooksCatalog(String search, Long categoryId) {
        List<Book> books;
        if (search != null && !search.trim().isEmpty()) {
            books = bookRepository.searchBooks(search.trim());
        } else {
            books = bookRepository.findAll();
        }

        if (categoryId != null) {
            books = books.stream()
                    .filter(b -> b.getCategory() != null && categoryId.equals(b.getCategory().getId()))
                    .collect(Collectors.toList());
        }

        return books.stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getStudentBorrowedBooks(User student) {
        return borrowRecordRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(BorrowRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ReservationResponse reserveBook(User student, Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        if (book.getAvailableCopies() != null && book.getAvailableCopies() > 0) {
            throw new IllegalStateException("Book is currently available for borrowing (" +
                    book.getAvailableCopies() + " copies available). Reservations are only allowed when all copies are issued.");
        }

        boolean alreadyReserved = reservationRepository.existsByBookIdAndStudentIdAndStatus(
                bookId, student.getId(), ReservationStatus.PENDING);
        if (alreadyReserved) {
            throw new IllegalStateException("You already have an active reservation for \"" + book.getTitle() + "\".");
        }

        Reservation reservation = new Reservation(book, student, LocalDate.now());
        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getStudentReservations(User student) {
        return reservationRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(ReservationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ReservationResponse cancelReservation(User student, Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (!reservation.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("Access denied: You can only cancel your own reservations.");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new IllegalStateException("Only active pending reservations can be cancelled.");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation updated = reservationRepository.save(reservation);
        return ReservationResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<StudentFineResponse> getStudentFines(User student) {
        List<BorrowRecord> records = borrowRecordRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        List<StudentFineResponse> fines = new ArrayList<>();

        for (BorrowRecord r : records) {
            StudentFineResponse fineResponse = StudentFineResponse.fromRecord(r);
            if (fineResponse.getFineAmount() > 0) {
                fines.add(fineResponse);
            }
        }

        return fines;
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(User student) {
        return UserResponse.fromEntity(student);
    }

    public UserResponse updateProfile(User student, UpdateStudentProfileRequest request) {
        User existing = userRepository.findById(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + student.getId()));

        existing.setFullName(request.getFullName().trim());
        if (request.getPhoneNumber() != null) {
            existing.setPhoneNumber(request.getPhoneNumber().trim());
        }

        User saved = userRepository.save(existing);
        return UserResponse.fromEntity(saved);
    }
}

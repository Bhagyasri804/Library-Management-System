package com.library.management.service;

import com.library.management.dto.BorrowRecordResponse;
import com.library.management.dto.CreateStudentRequest;
import com.library.management.dto.IssueBookRequest;
import com.library.management.dto.LibrarianDashboardStatsResponse;
import com.library.management.dto.UserResponse;
import com.library.management.exception.EmailAlreadyExistsException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.Book;
import com.library.management.model.BorrowRecord;
import com.library.management.model.BorrowStatus;
import com.library.management.model.Role;
import com.library.management.model.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibrarianService {

    private static final double DAILY_FINE_RATE = 2.0;

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final PasswordEncoder passwordEncoder;

    public LibrarianService(BookRepository bookRepository,
                            UserRepository userRepository,
                            BorrowRecordRepository borrowRecordRepository,
                            PasswordEncoder passwordEncoder) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LibrarianDashboardStatsResponse getStats() {
        long totalBooks = bookRepository.count();
        long availableBooks = bookRepository.sumAvailableCopies();
        long issuedBooks = borrowRecordRepository.countByStatus(BorrowStatus.ISSUED);
        long registeredStudents = userRepository.countByRole(Role.STUDENT);

        return new LibrarianDashboardStatsResponse(
                totalBooks,
                availableBooks,
                issuedBooks,
                registeredStudents
        );
    }

    public List<UserResponse> getStudents(String search) {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        if (StringUtils.hasText(search)) {
            String query = search.toLowerCase().trim();
            students = students.stream()
                    .filter(s -> s.getFullName().toLowerCase().contains(query)
                            || s.getEmail().toLowerCase().contains(query)
                            || (s.getPhoneNumber() != null && s.getPhoneNumber().contains(query)))
                    .collect(Collectors.toList());
        }

        return students.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse registerStudent(CreateStudentRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Student with email '" + email + "' is already registered");
        }

        User student = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null,
                Role.STUDENT
        );

        User saved = userRepository.save(student);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public BorrowRecordResponse issueBook(IssueBookRequest request) {
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("Book '" + book.getTitle() + "' has 0 copies available for checkout");
        }

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Selected user is not a Student");
        }

        if (!student.isActive()) {
            throw new IllegalStateException("Cannot issue book to deactivated student account");
        }

        LocalDate issueDate = LocalDate.now();
        LocalDate dueDate = request.getDueDate();
        if (dueDate == null) {
            int days = request.getBorrowDays() != null ? request.getBorrowDays() : 14;
            dueDate = issueDate.plusDays(days);
        }

        if (dueDate.isBefore(issueDate)) {
            throw new IllegalArgumentException("Due date cannot be before issue date");
        }

        // Deduct available copy
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        // Record borrow transaction
        BorrowRecord record = new BorrowRecord(book, student, issueDate, dueDate);
        BorrowRecord saved = borrowRecordRepository.save(record);

        return BorrowRecordResponse.fromEntity(saved);
    }

    public List<BorrowRecordResponse> getIssuedBooks(String search) {
        List<BorrowRecord> records;
        if (StringUtils.hasText(search)) {
            records = borrowRecordRepository.searchByStatusAndKeyword(BorrowStatus.ISSUED, search.trim());
        } else {
            records = borrowRecordRepository.findByStatusOrderByIssueDateDesc(BorrowStatus.ISSUED);
        }

        return records.stream()
                .map(BorrowRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public BorrowRecordResponse returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with id: " + recordId));

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new IllegalStateException("Book has already been returned");
        }

        LocalDate returnDate = LocalDate.now();
        record.setReturnDate(returnDate);
        record.setStatus(BorrowStatus.RETURNED);

        // Calculate late fine if returned after due date
        if (returnDate.isAfter(record.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(record.getDueDate(), returnDate);
            record.setFineAmount(daysLate * DAILY_FINE_RATE);
        } else {
            record.setFineAmount(0.0);
        }

        // Increase available copies back to book inventory
        Book book = record.getBook();
        if (book != null) {
            book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
            bookRepository.save(book);
        }

        BorrowRecord updated = borrowRecordRepository.save(record);
        return BorrowRecordResponse.fromEntity(updated);
    }
}

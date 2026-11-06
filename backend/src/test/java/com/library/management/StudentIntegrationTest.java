package com.library.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.dto.UpdateStudentProfileRequest;
import com.library.management.model.Book;
import com.library.management.model.BorrowRecord;
import com.library.management.model.BorrowStatus;
import com.library.management.model.Category;
import com.library.management.model.Reservation;
import com.library.management.model.ReservationStatus;
import com.library.management.model.Role;
import com.library.management.model.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.CategoryRepository;
import com.library.management.repository.ReservationRepository;
import com.library.management.repository.UserRepository;
import com.library.management.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class StudentIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private User testStudent;
    private String studentToken;
    private Book availableBook;
    private Book unavailableBook;

    @BeforeEach
    public void setup() {
        this.mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        reservationRepository.deleteAll();
        borrowRecordRepository.deleteAll();
        bookRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();

        // Create Student
        testStudent = new User();
        testStudent.setFullName("Alice Student");
        testStudent.setEmail("alice.student@univ.edu");
        testStudent.setPassword(passwordEncoder.encode("Student@123"));
        testStudent.setPhoneNumber("9876543210");
        testStudent.setRole(Role.STUDENT);
        testStudent.setActive(true);
        testStudent = userRepository.save(testStudent);
        studentToken = jwtTokenProvider.generateToken(testStudent);

        // Create Category
        Category category = new Category("Computer Science", "CS books");
        category = categoryRepository.save(category);

        // Create Available Book
        availableBook = new Book();
        availableBook.setTitle("Clean Code");
        availableBook.setAuthor("Robert C. Martin");
        availableBook.setIsbn("978-0132350884");
        availableBook.setCategory(category);
        availableBook.setTotalCopies(5);
        availableBook.setAvailableCopies(5);
        availableBook = bookRepository.save(availableBook);

        // Create Unavailable Book (all copies issued)
        unavailableBook = new Book();
        unavailableBook.setTitle("Designing Data-Intensive Applications");
        unavailableBook.setAuthor("Martin Kleppmann");
        unavailableBook.setIsbn("978-1449373320");
        unavailableBook.setCategory(category);
        unavailableBook.setTotalCopies(2);
        unavailableBook.setAvailableCopies(0);
        unavailableBook = bookRepository.save(unavailableBook);
    }

    @Test
    public void testStudentDashboardStats() throws Exception {
        mockMvc.perform(get("/api/student/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentName", equalTo("Alice Student")))
                .andExpect(jsonPath("$.currentlyBorrowedCount", equalTo(0)))
                .andExpect(jsonPath("$.availableBooksCount", equalTo(5)))
                .andExpect(jsonPath("$.overdueBooksCount", equalTo(0)))
                .andExpect(jsonPath("$.outstandingFines", equalTo(0.0)));
    }

    @Test
    public void testBrowseBooksCatalog() throws Exception {
        mockMvc.perform(get("/api/student/books")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(2)));
    }

    @Test
    public void testReserveUnavailableBookSuccess() throws Exception {
        mockMvc.perform(post("/api/student/reservations/" + unavailableBook.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookId", equalTo(unavailableBook.getId().intValue())))
                .andExpect(jsonPath("$.status", equalTo("PENDING")));

        assertEquals(1, reservationRepository.count());
    }

    @Test
    public void testReserveAvailableBookFails() throws Exception {
        // Books with available copies cannot be reserved
        mockMvc.perform(post("/api/student/reservations/" + availableBook.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("available for borrowing")));
    }

    @Test
    public void testPreventDuplicateActiveReservation() throws Exception {
        // First reservation succeeds
        mockMvc.perform(post("/api/student/reservations/" + unavailableBook.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated());

        // Duplicate reservation fails with 400 Bad Request
        mockMvc.perform(post("/api/student/reservations/" + unavailableBook.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already have an active reservation")));
    }

    @Test
    public void testCancelReservation() throws Exception {
        Reservation reservation = new Reservation(unavailableBook, testStudent, LocalDate.now());
        reservation = reservationRepository.save(reservation);

        mockMvc.perform(delete("/api/student/reservations/" + reservation.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", equalTo("CANCELLED")));

        Reservation updated = reservationRepository.findById(reservation.getId()).orElseThrow();
        assertEquals(ReservationStatus.CANCELLED, updated.getStatus());
    }

    @Test
    public void testStudentBorrowedBooksAndFines() throws Exception {
        // Create an overdue loan for the student
        BorrowRecord record = new BorrowRecord();
        record.setBook(availableBook);
        record.setStudent(testStudent);
        record.setIssueDate(LocalDate.now().minusDays(20));
        record.setDueDate(LocalDate.now().minusDays(6)); // 6 days overdue
        record.setStatus(BorrowStatus.ISSUED);
        record.setFineAmount(0.0);
        borrowRecordRepository.save(record);

        // Check borrowed books
        mockMvc.perform(get("/api/student/borrowed-books")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].bookTitle", equalTo("Clean Code")))
                .andExpect(jsonPath("$[0].overdue", equalTo(true)))
                .andExpect(jsonPath("$[0].overdueDays", equalTo(6)))
                .andExpect(jsonPath("$[0].fineAmount", equalTo(12.0)));

        // Check fines
        mockMvc.perform(get("/api/student/fines")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fineAmount", equalTo(12.0)))
                .andExpect(jsonPath("$[0].status", equalTo("UNPAID")));
    }

    @Test
    public void testUpdateProfile() throws Exception {
        UpdateStudentProfileRequest req = new UpdateStudentProfileRequest("Alice Wonderland", "5551234567");

        mockMvc.perform(put("/api/student/profile")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", equalTo("Alice Wonderland")))
                .andExpect(jsonPath("$.phoneNumber", equalTo("5551234567")))
                .andExpect(jsonPath("$.role", equalTo("STUDENT")));

        User updated = userRepository.findById(testStudent.getId()).orElseThrow();
        assertEquals("Alice Wonderland", updated.getFullName());
        assertEquals("5551234567", updated.getPhoneNumber());
        assertEquals(Role.STUDENT, updated.getRole()); // Role must remain STUDENT
    }
}

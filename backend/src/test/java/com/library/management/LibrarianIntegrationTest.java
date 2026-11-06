package com.library.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.dto.CreateStudentRequest;
import com.library.management.dto.IssueBookRequest;
import com.library.management.model.Book;
import com.library.management.model.Category;
import com.library.management.model.Role;
import com.library.management.model.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRecordRepository;
import com.library.management.repository.CategoryRepository;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class LibrarianIntegrationTest {

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
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String librarianToken;
    private String studentToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        String libEmail = "librarian_test_" + System.currentTimeMillis() + "@test.com";
        User librarian = userRepository.save(new User("Librarian Tester", libEmail, passwordEncoder.encode("pass"), "444", Role.LIBRARIAN));
        librarianToken = jwtTokenProvider.generateToken(librarian);

        String studentEmail = "student_test_" + System.currentTimeMillis() + "@test.com";
        User student = userRepository.save(new User("Student Tester", studentEmail, passwordEncoder.encode("pass"), "555", Role.STUDENT));
        studentToken = jwtTokenProvider.generateToken(student);
    }

    @Test
    void getStats_success() throws Exception {
        mockMvc.perform(get("/api/librarian/stats")
                        .header("Authorization", "Bearer " + librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBooks", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.availableBooks", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.issuedBooks", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.registeredStudents", greaterThanOrEqualTo(1)));
    }

    @Test
    void studentManagement_byLibrarian_success() throws Exception {
        String studentEmail = "new_student_" + System.currentTimeMillis() + "@test.com";
        CreateStudentRequest req = new CreateStudentRequest("New Registered Student", studentEmail, "studPass123", "9998887776");

        // 1. Register student
        mockMvc.perform(post("/api/librarian/students")
                        .header("Authorization", "Bearer " + librarianToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(studentEmail))
                .andExpect(jsonPath("$.role").value("STUDENT"));

        // 2. Search students
        mockMvc.perform(get("/api/librarian/students")
                        .param("search", "Registered Student")
                        .header("Authorization", "Bearer " + librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void bookIssue_and_return_cycle_success() throws Exception {
        Category cat = categoryRepository.save(new Category("Engineering " + System.currentTimeMillis(), "Engineering books"));
        Book book = bookRepository.save(new Book("System Design", "Alex Xu", "ISBN-" + System.currentTimeMillis(), cat, 2, 2, "Architecture"));

        User student = userRepository.save(new User("Borrowing Student", "borrower_" + System.currentTimeMillis() + "@test.com", passwordEncoder.encode("pass"), "777", Role.STUDENT));

        // 1. Issue Book
        IssueBookRequest issueReq = new IssueBookRequest(book.getId(), student.getId(), 14);
        String issueRes = mockMvc.perform(post("/api/librarian/issue")
                        .header("Authorization", "Bearer " + librarianToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(issueReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookTitle").value("System Design"))
                .andExpect(jsonPath("$.studentName").value("Borrowing Student"))
                .andExpect(jsonPath("$.status").value("ISSUED"))
                .andReturn().getResponse().getContentAsString();

        Long recordId = objectMapper.readTree(issueRes).get("id").asLong();

        // Verify available copies decreased to 1
        Book updatedBook = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(1, updatedBook.getAvailableCopies());

        // 2. View currently issued books
        mockMvc.perform(get("/api/librarian/issued-books")
                        .param("search", "System Design")
                        .header("Authorization", "Bearer " + librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // 3. Return Book
        mockMvc.perform(post("/api/librarian/return/" + recordId)
                        .header("Authorization", "Bearer " + librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RETURNED"));

        // Verify available copies restored to 2
        Book returnedBook = bookRepository.findById(book.getId()).orElseThrow();
        assertEquals(2, returnedBook.getAvailableCopies());
    }

    @Test
    void issueBook_fails_whenUnavailable() throws Exception {
        Category cat = categoryRepository.save(new Category("Fiction " + System.currentTimeMillis(), "Novels"));
        Book book = bookRepository.save(new Book("Rare Manuscript", "Author X", "ISBN-" + System.currentTimeMillis(), cat, 1, 0, "No copies"));
        User student = userRepository.save(new User("Student Waiting", "wait_" + System.currentTimeMillis() + "@test.com", passwordEncoder.encode("pass"), "888", Role.STUDENT));

        IssueBookRequest issueReq = new IssueBookRequest(book.getId(), student.getId(), 14);
        mockMvc.perform(post("/api/librarian/issue")
                        .header("Authorization", "Bearer " + librarianToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(issueReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void student_forbiddenFromLibrarianEndpoints() throws Exception {
        mockMvc.perform(get("/api/librarian/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/librarian/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/librarian/issued-books")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}

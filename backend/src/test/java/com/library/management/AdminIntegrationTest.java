package com.library.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.dto.BookRequest;
import com.library.management.dto.CategoryRequest;
import com.library.management.dto.CreateLibrarianRequest;
import com.library.management.dto.UpdateUserStatusRequest;
import com.library.management.model.Book;
import com.library.management.model.Category;
import com.library.management.model.Role;
import com.library.management.model.User;
import com.library.management.repository.BookRepository;
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

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class AdminIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;
    private String studentToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        String adminEmail = "admin_test_" + System.currentTimeMillis() + "@test.com";
        User admin = userRepository.save(new User("Admin Test", adminEmail, passwordEncoder.encode("pass"), "111", Role.ADMIN));
        adminToken = jwtTokenProvider.generateToken(admin);

        String studentEmail = "student_test_" + System.currentTimeMillis() + "@test.com";
        User student = userRepository.save(new User("Student Test", studentEmail, passwordEncoder.encode("pass"), "222", Role.STUDENT));
        studentToken = jwtTokenProvider.generateToken(student);
    }

    @Test
    void getStats_success() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBooks", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.totalStudents", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalLibrarians", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.availableBooks", greaterThanOrEqualTo(0)))
                .andExpect(jsonPath("$.issuedBooks", greaterThanOrEqualTo(0)));
    }

    @Test
    void categoryCrud_success() throws Exception {
        String catName = "Computer Science " + System.currentTimeMillis();
        CategoryRequest catReq = new CategoryRequest(catName, "CS Books and References");

        // 1. Add Category
        String res = mockMvc.perform(post("/api/admin/categories")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(catName))
                .andReturn().getResponse().getContentAsString();

        Long catId = objectMapper.readTree(res).get("id").asLong();

        // 2. View Category
        mockMvc.perform(get("/api/admin/categories/" + catId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(catName));

        // 3. Edit Category
        CategoryRequest updateReq = new CategoryRequest(catName + " Updated", "Updated Desc");
        mockMvc.perform(put("/api/admin/categories/" + catId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(catName + " Updated"));

        // 4. Delete Category
        mockMvc.perform(delete("/api/admin/categories/" + catId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        assertFalse(categoryRepository.existsById(catId));
    }

    @Test
    void bookCrud_and_search_success() throws Exception {
        Category cat = categoryRepository.save(new Category("Math " + System.currentTimeMillis(), "Math books"));

        String isbn = "ISBN-" + System.currentTimeMillis();
        BookRequest bookReq = new BookRequest("Advanced Calculus", "Isaac Newton", isbn, cat.getId(), 5, 5, "Calculus reference");

        // 1. Add Book
        String res = mockMvc.perform(post("/api/admin/books")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Advanced Calculus"))
                .andExpect(jsonPath("$.totalCopies").value(5))
                .andExpect(jsonPath("$.availableCopies").value(5))
                .andExpect(jsonPath("$.categoryName").value(cat.getName()))
                .andReturn().getResponse().getContentAsString();

        Long bookId = objectMapper.readTree(res).get("id").asLong();

        // 2. Search Books
        mockMvc.perform(get("/api/admin/books")
                        .param("search", "Calculus")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // 3. Edit Book
        BookRequest updateReq = new BookRequest("Calculus: Early Transcendentals", "Isaac Newton", isbn, cat.getId(), 10, 10, "Updated");
        mockMvc.perform(put("/api/admin/books/" + bookId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Calculus: Early Transcendentals"))
                .andExpect(jsonPath("$.totalCopies").value(10));

        // 4. Delete Book
        mockMvc.perform(delete("/api/admin/books/" + bookId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        assertFalse(bookRepository.existsById(bookId));
    }

    @Test
    void userManagement_librarians_and_statusToggle() throws Exception {
        // 1. Add Librarian
        String libEmail = "librarian_" + System.currentTimeMillis() + "@test.com";
        CreateLibrarianRequest libReq = new CreateLibrarianRequest("Test Librarian", libEmail, "libPass123", "555-0101");

        String res = mockMvc.perform(post("/api/admin/librarians")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(libReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("LIBRARIAN"))
                .andExpect(jsonPath("$.email").value(libEmail))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andReturn().getResponse().getContentAsString();

        Long libId = objectMapper.readTree(res).get("id").asLong();

        // 2. View Librarians
        mockMvc.perform(get("/api/admin/users")
                        .param("role", "LIBRARIAN")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));

        // 3. Deactivate User
        UpdateUserStatusRequest deactivateReq = new UpdateUserStatusRequest(false);
        mockMvc.perform(patch("/api/admin/users/" + libId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deactivateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        User updatedUser = userRepository.findById(libId).orElseThrow();
        assertFalse(updatedUser.isActive());

        // 4. Re-activate User
        UpdateUserStatusRequest activateReq = new UpdateUserStatusRequest(true);
        mockMvc.perform(patch("/api/admin/users/" + libId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(activateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void nonAdmin_blockedFromAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/books")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/categories")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }
}

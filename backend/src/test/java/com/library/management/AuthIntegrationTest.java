package com.library.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.management.dto.LoginRequest;
import com.library.management.dto.RegisterRequest;
import com.library.management.model.Role;
import com.library.management.model.User;
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

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
public class AuthIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void healthEndpointRemainsFunctional() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void successfulRegistration_assignsStudentRole_neverReturnsPassword() throws Exception {
        String uniqueEmail = "student_" + System.currentTimeMillis() + "@test.com";
        RegisterRequest request = new RegisterRequest("Test Student", uniqueEmail, "password123", "9876543210");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(uniqueEmail))
                .andExpect(jsonPath("$.user.role").value("STUDENT"))
                .andExpect(jsonPath("$.user.password").doesNotExist());

        // Verify password is encrypted in database
        User savedUser = userRepository.findByEmail(uniqueEmail).orElseThrow();
        assertTrue(passwordEncoder.matches("password123", savedUser.getPassword()));
        assertFalse(savedUser.getPassword().contains("password123"));
    }

    @Test
    void duplicateEmailRegistration_returnsConflict() throws Exception {
        String email = "duplicate_" + System.currentTimeMillis() + "@test.com";
        RegisterRequest request = new RegisterRequest("User One", email, "password123", "1234567890");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Attempting to register again with same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    void successfulLogin_and_invalidPassword() throws Exception {
        String email = "login_test_" + System.currentTimeMillis() + "@test.com";
        User user = new User("Login User", email, passwordEncoder.encode("correctPass123"), "1122334455", Role.STUDENT);
        userRepository.save(user);

        // 1. Correct credentials
        LoginRequest validLogin = new LoginRequest(email, "correctPass123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(email));

        // 2. Incorrect password
        LoginRequest invalidLogin = new LoginRequest(email, "wrongPass");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void unauthorizedApiAccess_returns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserMeEndpoint_and_logout() throws Exception {
        String email = "me_test_" + System.currentTimeMillis() + "@test.com";
        User user = new User("Current User", email, passwordEncoder.encode("pass123"), "9988776655", Role.STUDENT);
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user);

        // GET /api/auth/me with Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.fullName").value("Current User"))
                .andExpect(jsonPath("$.password").doesNotExist());

        // POST /api/auth/logout
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("Logged out successfully")));
    }

    @Test
    void roleBasedAccessRestrictions_enforced() throws Exception {
        // Create student, librarian and admin users
        String studentEmail = "student_role_" + System.currentTimeMillis() + "@test.com";
        User student = userRepository.save(new User("Student Role", studentEmail, passwordEncoder.encode("pass"), "111", Role.STUDENT));
        String studentToken = jwtTokenProvider.generateToken(student);

        String librarianEmail = "librarian_role_" + System.currentTimeMillis() + "@test.com";
        User librarian = userRepository.save(new User("Librarian Role", librarianEmail, passwordEncoder.encode("pass"), "222", Role.LIBRARIAN));
        String librarianToken = jwtTokenProvider.generateToken(librarian);

        String adminEmail = "admin_role_" + System.currentTimeMillis() + "@test.com";
        User admin = userRepository.save(new User("Admin Role", adminEmail, passwordEncoder.encode("pass"), "333", Role.ADMIN));
        String adminToken = jwtTokenProvider.generateToken(admin);

        // 1. Student access
        mockMvc.perform(get("/api/student/dashboard").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STUDENT"));

        // Student forbidden from librarian and admin dashboards
        mockMvc.perform(get("/api/librarian/dashboard").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        // 2. Librarian access
        mockMvc.perform(get("/api/librarian/dashboard").header("Authorization", "Bearer " + librarianToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("LIBRARIAN"));

        // Librarian forbidden from admin dashboard
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + librarianToken))
                .andExpect(status().isForbidden());

        // 3. Admin access
        mockMvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }
}

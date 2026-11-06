package com.library.management.security;

import com.library.management.model.Role;
import com.library.management.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long testExpiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(testSecret, testExpiration);
    }

    @Test
    void generateAndValidateToken_success() {
        User user = new User("John Doe", "john@example.com", "password123", "1234567890", Role.STUDENT);
        user.setId(10L);

        String token = jwtTokenProvider.generateToken(user);
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("john@example.com", jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    void validateToken_invalidToken_returnsFalse() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    void validateToken_expiredToken_returnsFalse() {
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider(testSecret, -1000); // already expired
        User user = new User("Jane Doe", "jane@example.com", "password123", "1234567890", Role.LIBRARIAN);
        user.setId(11L);

        String token = shortLivedProvider.generateToken(user);
        assertFalse(jwtTokenProvider.validateToken(token));
    }
}

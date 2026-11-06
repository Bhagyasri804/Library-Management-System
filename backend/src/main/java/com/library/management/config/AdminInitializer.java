package com.library.management.config;

import com.library.management.model.Role;
import com.library.management.model.User;
import com.library.management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@library.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.full-name:System Administrator}")
    private String adminFullName;

    @Value("${app.admin.phone:1234567890}")
    private String adminPhone;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.countByRole(Role.ADMIN) == 0) {
            String email = adminEmail.toLowerCase().trim();
            if (!userRepository.existsByEmail(email)) {
                User admin = new User(
                        adminFullName,
                        email,
                        passwordEncoder.encode(adminPassword),
                        adminPhone,
                        Role.ADMIN
                );
                userRepository.save(admin);
                logger.info("Initialized default ADMIN account with email: {}", email);
            }
        }
    }
}

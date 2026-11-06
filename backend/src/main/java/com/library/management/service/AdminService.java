package com.library.management.service;

import com.library.management.dto.AdminDashboardStatsResponse;
import com.library.management.dto.CreateLibrarianRequest;
import com.library.management.dto.UserResponse;
import com.library.management.exception.EmailAlreadyExistsException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.Role;
import com.library.management.model.User;
import com.library.management.repository.BookRepository;
import com.library.management.repository.CategoryRepository;
import com.library.management.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        BookRepository bookRepository,
                        CategoryRepository categoryRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminDashboardStatsResponse getDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalCopies = bookRepository.sumTotalCopies();
        long availableCopies = bookRepository.sumAvailableCopies();
        long issuedCopies = Math.max(0, totalCopies - availableCopies);
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalLibrarians = userRepository.countByRole(Role.LIBRARIAN);
        long totalCategories = categoryRepository.count();

        return new AdminDashboardStatsResponse(
                totalBooks,
                totalStudents,
                totalLibrarians,
                availableCopies,
                issuedCopies,
                totalCategories
        );
    }

    public List<UserResponse> getUsers(Role role) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }

        return users.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createLibrarian(CreateLibrarianRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Email is already registered: " + normalizedEmail);
        }

        User librarian = new User(
                request.getFullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null,
                Role.LIBRARIAN
        );

        User saved = userRepository.save(librarian);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() == Role.ADMIN && !active) {
            long activeAdmins = userRepository.findByRole(Role.ADMIN).stream().filter(User::isActive).count();
            if (activeAdmins <= 1) {
                throw new IllegalStateException("Cannot deactivate the only active Administrator account");
            }
        }

        user.setActive(active);
        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }
}

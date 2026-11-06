package com.library.management.service;

import com.library.management.dto.BookRequest;
import com.library.management.dto.BookResponse;
import com.library.management.exception.EmailAlreadyExistsException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.Book;
import com.library.management.model.Category;
import com.library.management.repository.BookRepository;
import com.library.management.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<BookResponse> getAllBooks(String search) {
        List<Book> books;
        if (StringUtils.hasText(search)) {
            books = bookRepository.searchBooks(search.trim());
        } else {
            books = bookRepository.findAll();
        }
        return books.stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return BookResponse.fromEntity(book);
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        String isbn = request.getIsbn().trim().toUpperCase();
        if (bookRepository.existsByIsbnIgnoreCase(isbn)) {
            throw new EmailAlreadyExistsException("Book with ISBN '" + isbn + "' already exists");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        int total = request.getTotalCopies() != null ? request.getTotalCopies() : 1;
        int available = request.getAvailableCopies() != null ? request.getAvailableCopies() : total;
        if (available > total) {
            available = total;
        }

        Book book = new Book(
                request.getTitle(),
                request.getAuthor(),
                isbn,
                category,
                total,
                available,
                request.getDescription()
        );

        Book saved = bookRepository.save(book);
        return BookResponse.fromEntity(saved);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        String newIsbn = request.getIsbn().trim().toUpperCase();
        if (!book.getIsbn().equalsIgnoreCase(newIsbn) && bookRepository.existsByIsbnIgnoreCase(newIsbn)) {
            throw new EmailAlreadyExistsException("Book with ISBN '" + newIsbn + "' already exists");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        }

        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setIsbn(newIsbn);
        book.setCategory(category);
        book.setDescription(request.getDescription());

        int newTotal = request.getTotalCopies() != null ? request.getTotalCopies() : book.getTotalCopies();
        int issued = Math.max(0, book.getTotalCopies() - book.getAvailableCopies());
        
        // Ensure total copies cannot be less than currently issued copies
        if (newTotal < issued) {
            throw new IllegalArgumentException("Total copies (" + newTotal + ") cannot be less than currently issued copies (" + issued + ")");
        }
        
        book.setTotalCopies(newTotal);
        book.setAvailableCopies(newTotal - issued);

        Book updated = bookRepository.save(book);
        return BookResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        int issued = Math.max(0, book.getTotalCopies() - book.getAvailableCopies());
        if (issued > 0) {
            throw new IllegalStateException("Cannot delete book '" + book.getTitle() + "' because " + issued + " copy/copies are currently issued");
        }

        bookRepository.delete(book);
    }
}

package com.library.management.controller;

import com.library.management.dto.BookRequest;
import com.library.management.dto.BookResponse;
import com.library.management.dto.MessageResponse;
import com.library.management.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // Browse and search books (General & Admin)
    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> getAllBooksPublic(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(bookService.getAllBooks(search));
    }

    @GetMapping("/books/{id}")
    public ResponseEntity<BookResponse> getBookByIdPublic(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    // Admin book management
    @GetMapping("/admin/books")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookResponse>> getAllBooksAdmin(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(bookService.getAllBooks(search));
    }

    @GetMapping("/admin/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> getBookByIdAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping("/admin/books")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.createBook(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/admin/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequest request) {
        BookResponse response = bookService.updateBook(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/books/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(new MessageResponse("Book deleted successfully"));
    }
}

package com.library.management.service;

import com.library.management.dto.CategoryRequest;
import com.library.management.dto.CategoryResponse;
import com.library.management.exception.EmailAlreadyExistsException;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.model.Category;
import com.library.management.repository.BookRepository;
import com.library.management.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> CategoryResponse.fromEntity(cat, bookRepository.countByCategoryId(cat.getId())))
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryResponse.fromEntity(category, bookRepository.countByCategoryId(category.getId()));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new EmailAlreadyExistsException("Category with name '" + name + "' already exists");
        }

        Category category = new Category(name, request.getDescription());
        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved, 0);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String newName = request.getName().trim();
        if (!category.getName().equalsIgnoreCase(newName) && categoryRepository.existsByNameIgnoreCase(newName)) {
            throw new EmailAlreadyExistsException("Category with name '" + newName + "' already exists");
        }

        category.setName(newName);
        category.setDescription(request.getDescription());
        Category updated = categoryRepository.save(category);
        return CategoryResponse.fromEntity(updated, bookRepository.countByCategoryId(updated.getId()));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long linkedBooks = bookRepository.countByCategoryId(id);
        if (linkedBooks > 0) {
            throw new IllegalStateException("Cannot delete category '" + category.getName() + "' because " + linkedBooks + " book(s) are assigned to it");
        }

        categoryRepository.delete(category);
    }
}

package com.library.management.dto;

import com.library.management.model.Category;

public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private long bookCount;

    public CategoryResponse() {
    }

    public CategoryResponse(Long id, String name, String description, long bookCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.bookCount = bookCount;
    }

    public static CategoryResponse fromEntity(Category category, long bookCount) {
        if (category == null) return null;
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), bookCount);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getBookCount() {
        return bookCount;
    }

    public void setBookCount(long bookCount) {
        this.bookCount = bookCount;
    }
}

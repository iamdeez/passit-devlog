package com.company.cs.category.controller;

import com.company.cs.dto.ApiResponse;
import com.company.cs.category.dto.CategoryCreateRequest;
import com.company.cs.category.dto.CategoryResponse;
import com.company.cs.category.dto.CategoryUpdateRequest;
import com.company.cs.category.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 카테고리 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response));
    }

    /**
     * 카테고리 단건 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(@PathVariable Long id) {
        CategoryResponse response = categoryService.getCategory(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 모든 카테고리 조회 (계층 구조 포함)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @RequestParam(required = false, defaultValue = "false") boolean withHierarchy) {
        List<CategoryResponse> responses = withHierarchy
                ? categoryService.getAllCategoriesWithHierarchy()
                : categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * 대분류 카테고리 조회
     */
    @GetMapping("/root")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<CategoryResponse> responses = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * 특정 부모의 하위 카테고리 조회
     */
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByParentId(
            @PathVariable Long parentId) {
        List<CategoryResponse> responses = categoryService.getCategoriesByParentId(parentId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * 특정 깊이의 카테고리 조회
     * depth: 1(대분류), 2(중분류), 3(소분류)
     */
    @GetMapping("/depth/{depth}")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesByDepth(
            @PathVariable Integer depth) {
        List<CategoryResponse> responses = categoryService.getCategoriesByDepth(depth);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    /**
     * 카테고리 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 카테고리 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

package com.company.cs.category.service;

import com.company.cs.category.dto.CategoryCreateRequest;
import com.company.cs.category.dto.CategoryResponse;
import com.company.cs.category.dto.CategoryUpdateRequest;
import com.company.cs.category.domain.Category;
import com.company.cs.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;

    /**
     * 카테고리 생성
     */
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        // 부모 카테고리 검증
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 카테고리를 찾을 수 없습니다: " + request.getParentId()));

            // 깊이 검증
            if (parent.getDepth() >= 3) {
                throw new IllegalArgumentException("3단계(소분류)까지만 생성 가능합니다");
            }

            // 중복 이름 검증
            if (categoryRepository.existsByNameAndParentId(request.getName(), request.getParentId())) {
                throw new IllegalArgumentException("같은 부모 하위에 동일한 이름의 카테고리가 이미 존재합니다");
            }
        } else {
            // 대분류 중복 검증
            if (categoryRepository.existsByNameAndParentIsNull(request.getName())) {
                throw new IllegalArgumentException("동일한 이름의 대분류가 이미 존재합니다");
            }
        }

        // 깊이 자동 계산
        int depth = parent != null ? parent.getDepth() + 1 : 1;

        Category category = Category.builder()
                .name(request.getName())
                .depth(depth)
                .parent(parent)
                .build();

        Category saved = categoryRepository.save(category);
        return CategoryResponse.from(saved);
    }

    /**
     * 카테고리 단건 조회
     */
    public CategoryResponse getCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + id));
        return CategoryResponse.from(category);
    }

    /**
     * 모든 카테고리 조회 (계층 구조 포함)
     */
    public List<CategoryResponse> getAllCategoriesWithHierarchy() {
        List<Category> rootCategories = categoryRepository.findAllRootCategoriesWithChildren();
        return rootCategories.stream()
                .map(CategoryResponse::fromWithChildren)
                .collect(Collectors.toList());
    }

    /**
     * 대분류만 조회
     */
    public List<CategoryResponse> getRootCategories() {
        List<Category> categories = categoryRepository.findByParentIsNull();
        return categories.stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 부모의 하위 카테고리 조회
     */
    public List<CategoryResponse> getCategoriesByParentId(Long parentId) {
        List<Category> categories = categoryRepository.findByParentId(parentId);
        return categories.stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 깊이의 카테고리 조회
     */
    public List<CategoryResponse> getCategoriesByDepth(Integer depth) {
        if (depth < 1 || depth > 3) {
            throw new IllegalArgumentException("깊이는 1(대분류), 2(중분류), 3(소분류)만 가능합니다");
        }
        List<Category> categories = categoryRepository.findByDepth(depth);
        return categories.stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 카테고리 수정
     */
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + id));

        // 이름 업데이트
        category.updateName(request.getName());

        // 부모 변경 처리
        if (request.getParentId() != null) {
            Category newParent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 카테고리를 찾을 수 없습니다: " + request.getParentId()));

            // 자기 자신을 부모로 설정하는 것을 방지
            if (newParent.getId().equals(id)) {
                throw new IllegalArgumentException("자기 자신을 부모로 설정할 수 없습니다");
            }

            // 순환 참조 방지 (자신의 자식을 부모로 설정하는 것 방지)
            if (isDescendant(newParent, category)) {
                throw new IllegalArgumentException("하위 카테고리를 부모로 설정할 수 없습니다");
            }

            category.updateParent(newParent);
        }

        return CategoryResponse.from(category);
    }

    /**
     * 카테고리 삭제
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + id));

        // 하위 카테고리가 있으면 삭제 불가
        // LAZY 로딩을 위해 children을 명시적으로 조회
        List<Category> children = categoryRepository.findByParentId(id);
        if (!children.isEmpty()) {
            throw new IllegalArgumentException("하위 카테고리가 존재하여 삭제할 수 없습니다");
        }

        categoryRepository.delete(category);
    }

    /**
     * 순환 참조 체크 (target이 category의 자손인지 확인)
     */
    private boolean isDescendant(Category target, Category category) {
        Category current = target;
        while (current != null) {
            if (current.getId().equals(category.getId())) {
                return true;
            }
            current = current.getParent();
        }
        return false;
    }
}

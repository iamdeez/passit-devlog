package com.company.cs.category.service;

import com.company.cs.category.domain.Category;
import com.company.cs.category.dto.CategoryCreateRequest;
import com.company.cs.category.dto.CategoryResponse;
import com.company.cs.category.dto.CategoryUpdateRequest;
import com.company.cs.category.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CategoryServiceTest {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryRepository categoryRepository;

    @BeforeEach
    void setUp() {
        categoryRepository.deleteAll();
    }

    @Test
    @DisplayName("대분류 카테고리 생성 성공")
    void createRootCategory() {
        // given
        CategoryCreateRequest request = new CategoryCreateRequest("전자제품", 1, null);

        // when
        CategoryResponse response = categoryService.createCategory(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getName()).isEqualTo("전자제품");
        assertThat(response.getDepth()).isEqualTo(1);
        assertThat(response.getParentId()).isNull();
    }

    @Test
    @DisplayName("중분류 카테고리 생성 성공")
    void createSubCategory() {
        // given
        Category root = Category.builder()
                .name("전자제품")
                .depth(1)
                .build();
        Category savedRoot = categoryRepository.save(root);

        CategoryCreateRequest request = new CategoryCreateRequest("스마트폰", 2, savedRoot.getId());

        // when
        CategoryResponse response = categoryService.createCategory(request);

        // then
        assertThat(response.getId()).isNotNull();
        assertThat(response.getName()).isEqualTo("스마트폰");
        assertThat(response.getDepth()).isEqualTo(2);
        assertThat(response.getParentId()).isEqualTo(savedRoot.getId());
    }

    @Test
    @DisplayName("같은 이름의 대분류 중복 생성 시 예외 발생")
    void createDuplicateRootCategory() {
        // given
        CategoryCreateRequest request1 = new CategoryCreateRequest("전자제품", 1, null);
        categoryService.createCategory(request1);

        CategoryCreateRequest request2 = new CategoryCreateRequest("전자제품", 1, null);

        // when & then
        assertThatThrownBy(() -> categoryService.createCategory(request2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("동일한 이름의 대분류가 이미 존재합니다");
    }

    @Test
    @DisplayName("3단계 초과 카테고리 생성 시 예외 발생")
    void createCategoryExceedingMaxDepth() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        Category savedRoot = categoryRepository.save(root);

        Category sub1 = Category.builder().name("스마트폰").depth(2).parent(savedRoot).build();
        Category savedSub1 = categoryRepository.save(sub1);

        Category sub2 = Category.builder().name("갤럭시").depth(3).parent(savedSub1).build();
        Category savedSub2 = categoryRepository.save(sub2);

        // depth 3인 카테고리를 부모로 하여 4단계를 만들려고 시도
        CategoryCreateRequest request = new CategoryCreateRequest("갤럭시S24", 4, savedSub2.getId());

        // when & then
        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("3단계(소분류)까지만 생성 가능합니다");
    }

    @Test
    @DisplayName("존재하지 않는 부모 카테고리로 생성 시 예외 발생")
    void createCategoryWithNonExistentParent() {
        // given
        CategoryCreateRequest request = new CategoryCreateRequest("스마트폰", 2, 999L);

        // when & then
        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("부모 카테고리를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("카테고리 단건 조회 성공")
    void getCategory() {
        // given
        Category category = Category.builder()
                .name("전자제품")
                .depth(1)
                .build();
        Category saved = categoryRepository.save(category);

        // when
        CategoryResponse response = categoryService.getCategory(saved.getId());

        // then
        assertThat(response.getId()).isEqualTo(saved.getId());
        assertThat(response.getName()).isEqualTo("전자제품");
        assertThat(response.getDepth()).isEqualTo(1);
    }

    @Test
    @DisplayName("존재하지 않는 카테고리 조회 시 예외 발생")
    void getNonExistentCategory() {
        // when & then
        assertThatThrownBy(() -> categoryService.getCategory(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("카테고리를 찾을 수 없습니다");
    }

    @Test
    @DisplayName("대분류 목록 조회 성공")
    void getRootCategories() {
        // given
        Category root1 = Category.builder().name("전자제품").depth(1).build();
        Category root2 = Category.builder().name("의류").depth(1).build();
        categoryRepository.save(root1);
        categoryRepository.save(root2);

        // when
        List<CategoryResponse> responses = categoryService.getRootCategories();

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting("name").containsExactlyInAnyOrder("전자제품", "의류");
    }

    @Test
    @DisplayName("카테고리 수정 성공")
    void updateCategory() {
        // given
        Category category = Category.builder()
                .name("전자제품")
                .depth(1)
                .build();
        Category saved = categoryRepository.save(category);

        CategoryUpdateRequest request = new CategoryUpdateRequest("디지털제품", null);

        // when
        CategoryResponse response = categoryService.updateCategory(saved.getId(), request);

        // then
        assertThat(response.getName()).isEqualTo("디지털제품");
    }

    @Test
    @DisplayName("자기 자신을 부모로 설정 시 예외 발생")
    void updateCategoryWithSelfAsParent() {
        // given
        Category category = Category.builder()
                .name("전자제품")
                .depth(1)
                .build();
        Category saved = categoryRepository.save(category);

        CategoryUpdateRequest request = new CategoryUpdateRequest("전자제품", saved.getId());

        // when & then
        assertThatThrownBy(() -> categoryService.updateCategory(saved.getId(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("자기 자신을 부모로 설정할 수 없습니다");
    }

    @Test
    @DisplayName("하위 카테고리가 있는 카테고리 삭제 시 예외 발생")
    void deleteCategoryWithChildren() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        Category savedRoot = categoryRepository.save(root);

        Category sub = Category.builder().name("스마트폰").depth(2).parent(savedRoot).build();
        categoryRepository.save(sub);

        // 영속성 컨텍스트를 플러시하여 관계를 확실히 저장
        categoryRepository.flush();

        // when & then
        assertThatThrownBy(() -> categoryService.deleteCategory(savedRoot.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("하위 카테고리가 존재하여 삭제할 수 없습니다");
    }

    @Test
    @DisplayName("하위 카테고리가 없는 카테고리 삭제 성공")
    void deleteCategoryWithoutChildren() {
        // given
        Category category = Category.builder()
                .name("전자제품")
                .depth(1)
                .build();
        Category saved = categoryRepository.save(category);

        // when
        categoryService.deleteCategory(saved.getId());

        // then
        assertThat(categoryRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("모든 카테고리 계층 구조 조회 성공")
    void getAllCategoriesWithHierarchy() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        Category savedRoot = categoryRepository.save(root);

        Category sub = Category.builder().name("스마트폰").depth(2).parent(savedRoot).build();
        categoryRepository.save(sub);

        // when
        List<CategoryResponse> responses = categoryService.getAllCategoriesWithHierarchy();

        // then
        assertThat(responses).isNotEmpty();
        assertThat(responses).extracting("name").contains("전자제품");
    }

    @Test
    @DisplayName("특정 부모의 하위 카테고리 조회 성공")
    void getCategoriesByParentId() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        Category savedRoot = categoryRepository.save(root);

        Category sub1 = Category.builder().name("스마트폰").depth(2).parent(savedRoot).build();
        Category sub2 = Category.builder().name("노트북").depth(2).parent(savedRoot).build();
        categoryRepository.save(sub1);
        categoryRepository.save(sub2);

        // when
        List<CategoryResponse> responses = categoryService.getCategoriesByParentId(savedRoot.getId());

        // then
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting("name").containsExactlyInAnyOrder("스마트폰", "노트북");
    }

    @Test
    @DisplayName("특정 깊이의 카테고리 조회 성공")
    void getCategoriesByDepth() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        categoryRepository.save(root);

        Category sub = Category.builder().name("스마트폰").depth(2).parent(root).build();
        categoryRepository.save(sub);

        // when
        List<CategoryResponse> responses = categoryService.getCategoriesByDepth(1);

        // then
        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getName()).isEqualTo("전자제품");
        assertThat(responses.get(0).getDepth()).isEqualTo(1);
    }

    @Test
    @DisplayName("잘못된 깊이로 조회 시 예외 발생")
    void getCategoriesByInvalidDepth() {
        // when & then
        assertThatThrownBy(() -> categoryService.getCategoriesByDepth(0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("깊이는 1(대분류), 2(중분류), 3(소분류)만 가능합니다");

        assertThatThrownBy(() -> categoryService.getCategoriesByDepth(4))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("깊이는 1(대분류), 2(중분류), 3(소분류)만 가능합니다");
    }

    @Test
    @DisplayName("하위 카테고리를 부모로 설정 시 예외 발생")
    void updateCategoryWithDescendantAsParent() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        Category savedRoot = categoryRepository.save(root);

        Category sub = Category.builder().name("스마트폰").depth(2).parent(savedRoot).build();
        Category savedSub = categoryRepository.save(sub);

        Category subSub = Category.builder().name("갤럭시").depth(3).parent(savedSub).build();
        Category savedSubSub = categoryRepository.save(subSub);

        CategoryUpdateRequest request = new CategoryUpdateRequest("스마트폰", savedSubSub.getId());

        // when & then
        assertThatThrownBy(() -> categoryService.updateCategory(savedSub.getId(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("하위 카테고리를 부모로 설정할 수 없습니다");
    }

    @Test
    @DisplayName("같은 부모 하위에 중복 이름 생성 시 예외 발생")
    void createDuplicateSubCategory() {
        // given
        Category root = Category.builder().name("전자제품").depth(1).build();
        Category savedRoot = categoryRepository.save(root);

        CategoryCreateRequest request1 = new CategoryCreateRequest("스마트폰", 2, savedRoot.getId());
        categoryService.createCategory(request1);

        CategoryCreateRequest request2 = new CategoryCreateRequest("스마트폰", 2, savedRoot.getId());

        // when & then
        assertThatThrownBy(() -> categoryService.createCategory(request2))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("같은 부모 하위에 동일한 이름의 카테고리가 이미 존재합니다");
    }
}

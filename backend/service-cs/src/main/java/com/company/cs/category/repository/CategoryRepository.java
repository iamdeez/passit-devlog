package com.company.cs.category.repository;

import com.company.cs.category.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByParentIsNull(); // 대분류 조회

    List<Category> findByParentId(Long parentId); // 특정 부모의 하위 카테고리 조회

    List<Category> findByDepth(Integer depth); // 특정 깊이의 카테고리 조회

    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent IS NULL")
    List<Category> findAllRootCategoriesWithChildren(); // 대분류와 하위 카테고리를 함께 조회

    boolean existsByNameAndParentId(String name, Long parentId); // 같은 부모 하위에 같은 이름이 있는지 확인

    boolean existsByNameAndParentIsNull(String name); // 대분류에 같은 이름이 있는지 확인
}

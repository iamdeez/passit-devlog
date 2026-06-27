package com.company.cs.category.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {

    @NotBlank(message = "카테고리 이름은 필수입니다")
    private String name;

    @Min(value = 1, message = "깊이는 1 이상이어야 합니다")
    @Max(value = 3, message = "깊이는 3 이하여야 합니다")
    private Integer depth;

    private Long parentId; // null이면 대분류
}

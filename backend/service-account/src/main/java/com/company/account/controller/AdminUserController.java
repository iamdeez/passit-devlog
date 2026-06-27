package com.company.account.controller;

import com.company.account.dto.ApiResponse;
import com.company.account.dto.UserRequest;
import com.company.account.dto.UserResponse;
import com.company.account.entity.User.UserStatus;
import com.company.account.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    /**
     * 관리자 회원 목록 조회
     * GET /api/admin/users?email=&status=
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        log.info("Admin request to search users - email: {}, status: {}, page: {}, size: {}",
                email, status, page, size);

        Page<UserResponse> response = userService.searchUsersWithPagination(
                email, status, page, size, sortBy, sortDirection);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 관리자 회원 상태 변경
     * PUT /api/admin/users/{userId}/status
     */
    @PutMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserRequest.UpdateStatus request) {
        log.info("Admin request to update status for user with ID: {}", userId);

        UserResponse response = userService.updateUserStatus(userId, request);

        return ResponseEntity.ok(ApiResponse.success(response, "사용자 상태가 변경되었습니다"));
    }
}

package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.dto.UserResponse;
import com.shoppro.entity.User;
import com.shoppro.entity.Enterprise;
import com.shoppro.repository.EnterpriseRepository;
import com.shoppro.service.UserService;
import com.shoppro.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 用户管理控制器
 * 处理用户管理、信息编辑、密码修改等操作
 *
 * @author ShopPro Team
 * @version 1.0.0
 */

@RestController
@RequestMapping("/users")
@Tag(name = "用户管理", description = "用户列表、详情、编辑、删除等操作")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final EnterpriseRepository enterpriseRepository;

    // 显式构造器注入
    public UserController(UserService userService, EnterpriseRepository enterpriseRepository) {
        this.userService = userService;
        this.enterpriseRepository = enterpriseRepository;
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    @Operation(summary = "分页查询用户列表")
    public ApiResponse<Page<UserResponse>> listUsers(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer roleFilter,
            @RequestParam(required = false) Boolean isAdminOnly,
            @RequestParam(required = false) Long enterpriseId,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortOrder) {
        try {
            // 归一化分页参数
            int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
            int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);

            if (!isPlatformAdmin()) {
                User currentUser = currentUser();
                enterpriseId = currentUser == null ? null : currentUser.getEnterpriseId();
                if (enterpriseId == null) {
                    return ApiResponse.error(403, "当前用户未绑定企业");
                }
            }

            Page<User> userPage = userService.listUsers(normalizedPageNo, normalizedPageSize, keyword, roleFilter,
                    isAdminOnly, enterpriseId, sortBy, sortOrder);
            Page<UserResponse> responsePage = convertToUserResponsePage(userPage);
            return ApiResponse.success(responsePage, "查询成功");
        } catch (Exception e) {
            log.error("查询用户列表失败", e);
            return ApiResponse.error(500, "查询失败: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    @Operation(summary = "创建用户")
    public ApiResponse<UserResponse> createUser(@RequestBody User user) {
        try {
            if (!isPlatformAdmin()) {
                User currentUser = currentUser();
                if (currentUser == null || currentUser.getEnterpriseId() == null) {
                    return ApiResponse.error(403, "当前用户未绑定企业");
                }
                if (user.getEnterpriseId() != null && !currentUser.getEnterpriseId().equals(user.getEnterpriseId())) {
                    return ApiResponse.error(403, "不能创建其他企业的用户");
                }
                user.setEnterpriseId(currentUser.getEnterpriseId());
                if (user.getRole() == null) user.setRole("sales");
                if (!List.of("sales_director", "sales_manager", "sales", "user").contains(user.getRole().toLowerCase())) {
                    return ApiResponse.error(403, "企业管理者只能创建销售负责人、销售经理、销售专员或普通用户");
                }
            }
            User createdUser = userService.createUser(user);
            return ApiResponse.success(convertToUserResponse(createdUser), "创建成功");
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("创建用户失败", e);
            return ApiResponse.error(500, "创建失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    @Operation(summary = "获取用户详情")
    public ApiResponse<UserResponse> getUserDetail(@PathVariable Long id) {
        try {
            User user = userService.getUserDetail(id);
            if (!isPlatformAdmin()) assertSameEnterprise(user);
            return ApiResponse.success(convertToUserResponse(user), "获取成功");
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        } catch (Exception e) {
            log.error("获取用户详情失败", e);
            return ApiResponse.error(500, "获取失败: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    @Operation(summary = "获取当前用户信息")
    public ApiResponse<UserResponse> getProfile(
            @RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return ApiResponse.error(401, "未登录");
            }
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            User user = userService.getCurrentUser(token);
            if (user == null) {
                return ApiResponse.error(401, "用户不存在或Token无效");
            }
            return ApiResponse.success(convertToUserResponse(user), "获取成功");
        } catch (Exception e) {
            log.error("获取个人信息失败", e);
            return ApiResponse.error(500, "系统错误");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER') or @userController.isCurrentUser(#id)")
    @Operation(summary = "编辑用户信息")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody User userInfo) {
        try {
            User currentUser = currentUser();
            User targetUser = userService.getById(id);
            if (!isPlatformAdmin()) {
                if (currentUser == null || targetUser == null
                        || currentUser.getEnterpriseId() == null
                        || !currentUser.getEnterpriseId().equals(targetUser.getEnterpriseId())) {
                    return ApiResponse.error(403, "无权修改其他企业用户");
                }
                if (userInfo.getRole() != null && !List.of("sales_director", "sales_manager", "sales", "user")
                        .contains(userInfo.getRole().toLowerCase())) {
                    return ApiResponse.error(403, "角色只能设置为销售负责人、销售经理、销售专员或普通用户");
                }
                if (userInfo.getEnterpriseId() != null && !userInfo.getEnterpriseId().equals(targetUser.getEnterpriseId())) {
                    return ApiResponse.error(403, "只有平台管理员可以修改企业归属");
                }
            }
            // 创建一个干净的User对象，只包含需要更新的字段
            // 避免触发MyBatis-Plus的自动UPDATE
            User cleanUserInfo = new User();
            cleanUserInfo.setRealName(userInfo.getRealName());
            cleanUserInfo.setPhone(userInfo.getPhone());
            cleanUserInfo.setEmail(userInfo.getEmail());
            cleanUserInfo.setRole(userInfo.getRole() == null ? targetUser.getRole() : userInfo.getRole());
            cleanUserInfo.setEnterpriseId(userInfo.getEnterpriseId() == null ? targetUser.getEnterpriseId() : userInfo.getEnterpriseId());
            cleanUserInfo.setDepartmentId(userInfo.getDepartmentId());
            cleanUserInfo.setSalesTargets(userInfo.getSalesTargets());

            boolean result = userService.updateUserInfo(id, cleanUserInfo);
            if (result) {
                User updatedUser = userService.getUserDetail(id);
                return ApiResponse.success(convertToUserResponse(updatedUser), "更新成功");
            }
            return ApiResponse.error("更新失败", 500);
        } catch (Exception e) {
            log.error("更新用户信息失败", e);
            return ApiResponse.error(500, "更新失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or @userController.isCurrentUser(#id)")
    @Operation(summary = "修改密码")
    public ApiResponse<Void> changePassword(
            @PathVariable Long id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        try {
            boolean result = userService.changePassword(id, oldPassword, newPassword);
            if (result) {
                return ApiResponse.success(null, "密码修改成功");
            }
            return ApiResponse.error("密码修改失败", 500);
        } catch (RuntimeException e) {
            return ApiResponse.error(e.getMessage(), 400);
        } catch (Exception e) {
            log.error("修改密码失败", e);
            return ApiResponse.error(500, "修改失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    @Operation(summary = "启用/禁用用户")
    public ApiResponse<Void> toggleUserStatus(@PathVariable Long id) {
        try {
            if (!isPlatformAdmin()) assertSameEnterprise(userService.getById(id));
            boolean result = userService.toggleUserStatus(id);
            if (result) {
                return ApiResponse.success(null, "状态更新成功");
            }
            return ApiResponse.error("状态更新失败", 500);
        } catch (Exception e) {
            log.error("启用/禁用用户失败", e);
            return ApiResponse.error(500, "更新失败: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "重置用户密码")
    public ApiResponse<Void> resetPassword(@PathVariable Long id, @RequestParam String newPassword) {
        try {
            boolean result = userService.resetPassword(id, newPassword);
            if (result) {
                return ApiResponse.success(null, "密码重置成功");
            }
            return ApiResponse.error("密码重置失败", 500);
        } catch (Exception e) {
            log.error("重置密码失败", e);
            return ApiResponse.error(500, "重置失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除用户")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        try {
            boolean result = userService.removeById(id);
            if (result) {
                return ApiResponse.success(null, "删除成功");
            }
            return ApiResponse.error("删除失败", 500);
        } catch (Exception e) {
            log.error("删除用户失败", e);
            return ApiResponse.error(500, "删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "批量导入用户")
    public ApiResponse<Integer> importUsers(@RequestBody String csvContent) {
        try {
            int count = userService.bulkImportUsers(csvContent);
            return ApiResponse.success(count, "成功导入" + count + "个用户");
        } catch (Exception e) {
            log.error("批量导入用户失败", e);
            return ApiResponse.error(500, "导入失败: " + e.getMessage());
        }
    }

    /**
     * 检查是否为当前用户
     */
    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        String username = authentication.getName();
        User currentUser = userService.getByUsername(username);
        return currentUser != null && currentUser.getId().equals(userId);
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(item -> authority.equals(item.getAuthority()));
    }

    private boolean isPlatformAdmin() {
        return hasAuthority("ROLE_ADMIN") || hasAuthority("ROLE_SUPER_ADMIN")
                || hasAuthority("ROLE_PLATFORM_ADMIN");
    }

    private void assertSameEnterprise(User targetUser) {
        User current = currentUser();
        if (current == null || targetUser == null || current.getEnterpriseId() == null
                || !current.getEnterpriseId().equals(targetUser.getEnterpriseId())) {
            throw new SecurityException("无权访问其他企业用户");
        }
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return null;
        return userService.getByUsername(authentication.getName());
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setRealName(user.getRealName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setLastLoginAt(user.getLastLoginAt());
        response.setCreatedAt(user.getCreatedAt());
        response.setSalesTargets(user.getSalesTargets());

        // 查询企业信息
        if (user.getEnterpriseId() != null) {
            response.setEnterpriseId(user.getEnterpriseId());
            Enterprise enterprise = enterpriseRepository.selectById(user.getEnterpriseId());
            if (enterprise != null) {
                response.setEnterpriseName(enterprise.getName());
            }
        }

        return response;
    }

    private Page<UserResponse> convertToUserResponsePage(Page<User> userPage) {
        Page<UserResponse> responsePage = new Page<>(userPage.getCurrent(), userPage.getSize(), userPage.getTotal());
        responsePage.setRecords(userPage.getRecords().stream().map(this::convertToUserResponse).toList());
        return responsePage;
    }
}

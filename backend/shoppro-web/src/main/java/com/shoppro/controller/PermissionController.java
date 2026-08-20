package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Permission;
import com.shoppro.service.PermissionService;
import com.shoppro.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 权限管理控制器
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/permissions")
@Tag(name = "权限管理", description = "权限的增删改查、权限检验等功能")
public class PermissionController {

    private static final Logger log = LoggerFactory.getLogger(PermissionController.class);

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建权限")
    public ApiResponse<Permission> createPermission(@RequestBody Permission permission) {
        log.info("创建权限: {}", permission.getName());
        Permission result = permissionService.createPermission(permission);
        return ApiResponse.success(result, "权限创建成功");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "编辑权限")
    public ApiResponse<Permission> updatePermission(@PathVariable Long id, @RequestBody Permission permission) {
        log.info("编辑权限: {}", id);
        permission.setId(id);
        Permission result = permissionService.updatePermission(permission);
        return ApiResponse.success(result, "权限编辑成功");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除权限")
    public ApiResponse<Void> deletePermission(@PathVariable Long id) {
        log.info("删除权限: {}", id);
        permissionService.deletePermission(id);
        return ApiResponse.success(null, "权限删除成功");
    }

    @PostMapping("/{id}/soft-delete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "软删除权限")
    public ApiResponse<Void> softDeletePermission(@PathVariable Long id) {
        log.info("软删除权限: {}", id);
        permissionService.softDeletePermission(id);
        return ApiResponse.success(null, "权限已禁用");
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "恢复权限")
    public ApiResponse<Void> restorePermission(@PathVariable Long id) {
        log.info("恢复权限: {}", id);
        permissionService.restorePermission(id);
        return ApiResponse.success(null, "权限已恢复");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "获取权限详情")
    public ApiResponse<Permission> getById(@PathVariable Long id) {
        log.info("获取权限详情: {}", id);
        Permission permission = permissionService.getById(id);
        return ApiResponse.success(permission, "获取成功");
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "按代码查询权限")
    public ApiResponse<Permission> getByCode(@PathVariable String code) {
        log.info("按代码查询权限: {}", code);
        Permission permission = permissionService.getByCode(code);
        return ApiResponse.success(permission, "获取成功");
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "分页查询权限列表")
    public ApiResponse<Page<Permission>> pagePermissions(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String resource,
            @RequestParam(required = false) Integer status) {
        log.info("分页查询权限: pageNo={}, pageSize={}", pageNo, pageSize);
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Permission> page = permissionService.pagePermissions(normalizedPageNo, normalizedPageSize, name, resource, status);
        return ApiResponse.success(page, "查询成功");
    }

    @GetMapping("/enabled")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    @Operation(summary = "获取所有启用权限")
    public ApiResponse<List<Permission>> getAllEnabledPermissions() {
        log.info("获取所有启用权限");
        List<Permission> permissions = permissionService.getAllEnabledPermissions();
        return ApiResponse.success(permissions, "获取成功");
    }

    @GetMapping("/resource/{resource}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    @Operation(summary = "按资源查询权限")
    public ApiResponse<List<Permission>> getPermissionsByResource(@PathVariable String resource) {
        log.info("按资源查询权限: {}", resource);
        List<Permission> permissions = permissionService.getPermissionsByResource(resource);
        return ApiResponse.success(permissions, "获取成功");
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "获取用户权限")
    public ApiResponse<List<Permission>> getUserPermissions(@PathVariable Long userId) {
        log.info("获取用户权限: {}", userId);
        List<Permission> permissions = permissionService.getUserPermissions(userId);
        return ApiResponse.success(permissions, "获取成功");
    }

    @GetMapping("/role/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "获取角色权限")
    public ApiResponse<List<Permission>> getRolePermissions(@PathVariable Long roleId) {
        log.info("获取角色权限: {}", roleId);
        List<Permission> permissions = permissionService.getRolePermissions(roleId);
        return ApiResponse.success(permissions, "获取成功");
    }

    @GetMapping("/user/{userId}/check/{permissionCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "检查用户是否拥有权限")
    public ApiResponse<Boolean> hasPermission(
            @PathVariable Long userId,
            @PathVariable String permissionCode) {
        log.info("检查用户权限: userId={}, permissionCode={}", userId, permissionCode);
        boolean hasPermission = permissionService.hasPermission(userId, permissionCode);
        return ApiResponse.success(hasPermission, "检查成功");
    }

    @PostMapping("/user/{userId}/batch-check")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    @Operation(summary = "批量检查用户权限")
    public ApiResponse<List<Boolean>> hasPermissions(
            @PathVariable Long userId,
            @RequestBody List<String> permissionCodes) {
        log.info("批量检查用户权限: userId={}, 权限数={}", userId, permissionCodes.size());
        List<Boolean> result = permissionService.hasPermissions(userId, permissionCodes);
        return ApiResponse.success(result, "检查成功");
    }

    @PostMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "启用权限")
    public ApiResponse<Void> enablePermission(@PathVariable Long id) {
        log.info("启用权限: {}", id);
        permissionService.enablePermission(id);
        return ApiResponse.success(null, "权限已启用");
    }

    @PostMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "禁用权限")
    public ApiResponse<Void> disablePermission(@PathVariable Long id) {
        log.info("禁用权限: {}", id);
        permissionService.disablePermission(id);
        return ApiResponse.success(null, "权限已禁用");
    }

    @GetMapping("/resources")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "获取所有资源列表")
    public ApiResponse<List<String>> getAllResources() {
        log.info("获取所有资源列表");
        List<String> resources = permissionService.getAllResources();
        return ApiResponse.success(resources, "获取成功");
    }

    @GetMapping("/count/enabled")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    @Operation(summary = "统计启用权限数")
    public ApiResponse<Integer> countEnabledPermissions() {
        log.info("统计启用权限数");
        int count = permissionService.countEnabledPermissions();
        return ApiResponse.success(count, "统计成功");
    }
}

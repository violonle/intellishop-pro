package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Role;
import com.shoppro.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理控制器
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/roles")
@Tag(name = "角色管理", description = "角色的增删改查及权限分配")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    @Operation(summary = "获取所有角色")
    public ApiResponse<List<Role>> getAllRoles() {
        return ApiResponse.success(roleService.getAllEnabledRoles());
    }

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    @Operation(summary = "分页获取角色")
    public ApiResponse<Page<Role>> pageRoles(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        return ApiResponse.success(roleService.pageRoles(pageNo, pageSize, name, status));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建角色")
    public ApiResponse<Role> createRole(@RequestBody Role role) {
        return ApiResponse.success(roleService.createRole(role));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新角色")
    public ApiResponse<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        role.setId(id);
        return ApiResponse.success(roleService.updateRole(role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除角色")
    public ApiResponse<Boolean> deleteRole(@PathVariable Long id) {
        return ApiResponse.success(roleService.deleteRole(id));
    }

    @PostMapping("/{id}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "为角色分配权限")
    public ApiResponse<Void> assignPermissions(@PathVariable Long id, @RequestBody List<Long> permissionIds) {
        roleService.assignPermissionsToRole(id, permissionIds);
        return ApiResponse.success(null, "权限分配成功");
    }
}

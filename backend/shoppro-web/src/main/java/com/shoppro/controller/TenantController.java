package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Enterprise;
import com.shoppro.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@Tag(name = "Tenant Management", description = "租户（企业）管理接口")
@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @Operation(summary = "分页获取租户列表")
    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    public ApiResponse<Page<Enterprise>> getTenantPage(
            @RequestParam(value = "page", defaultValue = "1") int pageNo,
            @RequestParam(value = "size", defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(tenantService.getTenantPage(pageNo, pageSize, name, status));
    }

    @Operation(summary = "获取租户详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    public ApiResponse<Enterprise> getTenantById(@PathVariable Long id) {
        return ApiResponse.success(tenantService.getTenantById(id));
    }

    @Operation(summary = "创建租户")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    public ApiResponse<Enterprise> createTenant(@RequestBody Enterprise tenant) {
        return ApiResponse.success(tenantService.createTenant(tenant));
    }

    @Operation(summary = "更新租户")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    public ApiResponse<Enterprise> updateTenant(@PathVariable Long id, @RequestBody Enterprise tenant) {
        return ApiResponse.success(tenantService.updateTenant(id, tenant));
    }

    @Operation(summary = "删除租户")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    public ApiResponse<Void> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ApiResponse.success(null);
    }
}

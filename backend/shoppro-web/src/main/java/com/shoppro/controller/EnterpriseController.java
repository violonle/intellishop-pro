package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Enterprise;
import com.shoppro.entity.User;
import com.shoppro.service.EnterpriseService;
import com.shoppro.service.UserService;
import com.shoppro.service.DataScopeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 企业控制器
 */
@Tag(name = "Enterprise Management", description = "企业认证及相关设置接口")
@RestController
@RequestMapping("/enterprise")
public class EnterpriseController {

    private final EnterpriseService enterpriseService;
    private final UserService userService;
    private final DataScopeService dataScopeService;

    public EnterpriseController(EnterpriseService enterpriseService, UserService userService,
                                DataScopeService dataScopeService) {
        this.enterpriseService = enterpriseService;
        this.userService = userService;
        this.dataScopeService = dataScopeService;
    }

    @Operation(summary = "获取当前企业信息")
    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER', 'SALES', 'USER')")
    public ApiResponse<Enterprise> getCurrent() {
        Enterprise enterprise = enterpriseService.getCurrent();
        if (enterprise == null) {
            throw new IllegalStateException("当前用户未绑定企业");
        }
        return ApiResponse.success(enterprise);
    }

    @Operation(summary = "更新当前企业信息")
    @PutMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    public ApiResponse<Enterprise> updateCurrent(@RequestBody Enterprise enterprise) {
        Enterprise updated = enterpriseService.updateCurrent(enterprise);
        return ApiResponse.success(updated);
    }

    @Operation(summary = "提交企业认证信息")
    @PostMapping("/certification")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    public ApiResponse<Enterprise> submitCertification(@RequestBody Enterprise enterprise) {
        if (enterprise.getId() != null) assertEnterpriseAccess(enterprise.getId());
        return ApiResponse.success(enterpriseService.submitCertification(enterprise));
    }

    @Operation(summary = "查询审核状态")
    @GetMapping("/certification/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    public ApiResponse<Enterprise> getCertificationStatus(@PathVariable Long id) {
        assertEnterpriseAccess(id);
        return ApiResponse.success(enterpriseService.getCertificationStatus(id));
    }

    @Operation(summary = "更新审核状态 (管理端)")
    @PutMapping("/certification/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
    public ApiResponse<Void> updateStatus(
            @PathVariable Long id,
            @RequestParam Integer status,
            @RequestParam(required = false) String reason) {
        enterpriseService.updateAuditStatus(id, status, reason);
        return ApiResponse.success(null);
    }

    @Operation(summary = "获取企业团队成员列表")
    @GetMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    public ApiResponse<List<User>> getMembers(@PathVariable Long id) {
        assertEnterpriseAccess(id);
        List<User> members = userService.getUsersByEnterpriseId(id);
        return ApiResponse.success(members);
    }

    @Operation(summary = "添加团队成员")
    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'SALES_DIRECTOR', 'SALES_MANAGER', 'MANAGER')")
    public ApiResponse<User> addMember(
            @PathVariable Long id,
            @RequestBody User user) {
        assertEnterpriseAccess(id);
        user.setEnterpriseId(id);
        User created = userService.createUser(user);
        return ApiResponse.success(created);
    }

    @Operation(summary = "移除团队成员")
    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    public ApiResponse<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        assertEnterpriseAccess(id);
        User target = userService.getUserDetail(userId);
        if (target == null || !id.equals(target.getEnterpriseId())) {
            throw new IllegalArgumentException("成员不属于当前企业");
        }
        userService.deleteUser(userId);
        return ApiResponse.success(null);
    }

    private void assertEnterpriseAccess(Long id) {
        DataScopeService.Scope scope = dataScopeService.current();
        if (!scope.isAllScope() && (scope.enterpriseId() == null || !scope.enterpriseId().equals(id))) {
            throw new SecurityException("无权访问其他企业");
        }
    }
}

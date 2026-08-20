package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.SecurityLog;
import com.shoppro.service.SecurityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/security-logs")
@Tag(name = "安全审计日志")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
public class SecurityLogController {

    private final SecurityLogService securityLogService;

    public SecurityLogController(SecurityLogService securityLogService) {
        this.securityLogService = securityLogService;
    }

    @GetMapping
    @Operation(summary = "获取安全日志列表")
    public ApiResponse<Page<SecurityLog>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String ipAddress) {
        Page<SecurityLog> result = securityLogService.list(page, size, action, username, ipAddress);
        return ApiResponse.success(result);
    }
}

package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.SystemSetting;
import com.shoppro.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

@Tag(name = "System Settings", description = "系统全局参数配置")
@RestController
@RequestMapping("/settings")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    public SystemSettingController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    @Operation(summary = "获取所有配置")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    public ApiResponse<List<SystemSetting>> getAll() {
        return ApiResponse.success(systemSettingService.getAllSettings());
    }

    @Operation(summary = "按类型获取配置")
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    public ApiResponse<Map<String, String>> getByType(@PathVariable String type) {
        return ApiResponse.success(systemSettingService.getSettingsByType(type));
    }

    @Operation(summary = "按Key获取配置")
    @GetMapping("/{key}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    public ApiResponse<String> getByKey(@PathVariable String key) {
        return ApiResponse.success(systemSettingService.getSettingValue(key));
    }

    @Operation(summary = "保存或更新配置")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    public ApiResponse<Void> save(@RequestBody SystemSetting setting) {
        systemSettingService.saveSetting(setting.getConfigKey(), setting.getConfigValue(), setting.getDescription());
        return ApiResponse.success(null);
    }
}

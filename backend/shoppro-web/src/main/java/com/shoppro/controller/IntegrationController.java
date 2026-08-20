package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.service.integration.IntegrationService;
import com.shoppro.service.integration.WeComService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;

/**
 * 第三方集成统一控制器
 * 管理企业微信、钉钉、短信、邮件、支付等集成
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/integration")
@Tag(name = "第三方集成", description = "统一管理第三方集成配置、测试和监控")
@ConditionalOnBean(WeComService.class)
public class IntegrationController {

    private static final Logger log = LoggerFactory.getLogger(IntegrationController.class);

    private final IntegrationService integrationService;
    private final WeComService weComService;

    public IntegrationController(IntegrationService integrationService, WeComService weComService) {
        this.integrationService = integrationService;
        this.weComService = weComService;
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "获取所有集成状态")
    public ApiResponse<Map<String, Map<String, Object>>> getAllIntegrationStatus() {
        try {
            Map<String, Map<String, Object>> status = integrationService.getAllIntegrationStatus();
            return ApiResponse.success(status, "获取成功");
        } catch (Exception e) {
            log.error("获取集成状态异常", e);
            return ApiResponse.error(500, "获取失败: " + e.getMessage());
        }
    }

    @GetMapping("/{type}/config")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "获取集成配置")
    public ApiResponse<Map<String, Object>> getIntegrationConfig(@PathVariable String type) {
        try {
            Map<String, Object> config = integrationService.getIntegrationConfig(type);
            return ApiResponse.success(config, "获取成功");
        } catch (Exception e) {
            log.error("获取集成配置异常: {}", type, e);
            return ApiResponse.error(500, "获取失败: " + e.getMessage());
        }
    }

    @PutMapping("/{type}/config")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新集成配置")
    public ApiResponse<Boolean> updateIntegrationConfig(
            @PathVariable String type,
            @RequestBody Map<String, Object> config) {
        try {
            boolean result = integrationService.updateIntegrationConfig(type, config);
            if (result) {
                log.info("集成配置更新成功: {}", type);
                return ApiResponse.success(true, "配置更新成功");
            } else {
                return ApiResponse.error(500, "配置更新失败");
            }
        } catch (Exception e) {
            log.error("更新集成配置异常: {}", type, e);
            return ApiResponse.error(500, "更新失败: " + e.getMessage());
        }
    }

    @PostMapping("/{type}/test")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "测试集成连接")
    public ApiResponse<Boolean> testIntegrationConnection(@PathVariable String type) {
        try {
            boolean result = integrationService.testIntegrationConnection(type);
            if (result) {
                log.info("集成连接测试成功: {}", type);
                return ApiResponse.success(true, "连接测试成功");
            } else {
                return ApiResponse.error(500, "连接测试失败");
            }
        } catch (Exception e) {
            log.error("测试集成连接异常: {}", type, e);
            return ApiResponse.error(500, "测试失败: " + e.getMessage());
        }
    }

    @GetMapping("/{type}/logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "获取集成日志")
    public ApiResponse<?> getIntegrationLogs(
            @PathVariable String type,
            @RequestParam(defaultValue = "100") int limit) {
        try {
            java.util.List<Map<String, Object>> logs = integrationService.getIntegrationLogs(type, limit);
            return ApiResponse.success(logs, "获取成功");
        } catch (Exception e) {
            log.error("获取集成日志异常: {}", type, e);
            return ApiResponse.error(500, "获取失败: " + e.getMessage());
        }
    }

    @GetMapping("/{type}/error-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "获取错误统计")
    public ApiResponse<Map<String, Long>> getErrorStatistics(@PathVariable String type) {
        try {
            Map<String, Long> stats = integrationService.getErrorStatistics(type);
            return ApiResponse.success(stats, "获取成功");
        } catch (Exception e) {
            log.error("获取错误统计异常: {}", type, e);
            return ApiResponse.error(500, "获取失败: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    @Operation(summary = "第三方集成健康检查")
    public ApiResponse<Map<String, Object>> healthCheck() {
        try {
            Map<String, Object> health = new HashMap<>();

            // 检查企业微信
            try {
                String wecomToken = weComService.getAccessToken();
                health.put("wecom", wecomToken != null ? "healthy" : "unhealthy");
            } catch (Exception e) {
                health.put("wecom", "error: " + e.getMessage());
            }

            // 其他集成的检查可以继续添加
            health.put("timestamp", System.currentTimeMillis());

            return ApiResponse.success(health, "健康检查完成");
        } catch (Exception e) {
            log.error("健康检查异常", e);
            return ApiResponse.error(500, "健康检查失败: " + e.getMessage());
        }
    }
}
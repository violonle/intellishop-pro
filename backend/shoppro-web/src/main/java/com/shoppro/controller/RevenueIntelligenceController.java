package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AiRevenueConfig;
import com.shoppro.service.RevenueIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Revenue Intelligence", description = "收入运营与管道健康分析")
@RestController
@RequestMapping("/ai/revenue")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class RevenueIntelligenceController {

    private final RevenueIntelligenceService revenueService;

    public RevenueIntelligenceController(RevenueIntelligenceService revenueService) {
        this.revenueService = revenueService;
    }

    @Operation(summary = "获取收入运营看板核心指标")
    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> getDashboard() {
        return ApiResponse.success(revenueService.getRevenueDashboard());
    }

    @Operation(summary = "获取管道健康度与阶段瓶颈分布")
    @GetMapping("/pipeline")
    public ApiResponse<Map<String, Object>> getPipeline() {
        return ApiResponse.success(revenueService.getPipelineHealth());
    }

    @Operation(summary = "获取动态成交概率(Win Rate)趋势与归因")
    @GetMapping("/win-rate")
    public ApiResponse<Map<String, Object>> getWinRate() {
        return ApiResponse.success(revenueService.getWinRateTrends());
    }

    @Operation(summary = "获取风险停滞商机清单")
    @GetMapping("/deals/at-risk")
    public ApiResponse<List<Map<String, Object>>> getAtRiskDeals() {
        return ApiResponse.success(revenueService.getAtRiskDeals());
    }

    @Operation(summary = "单个商机 AI 深度诊断")
    @GetMapping("/deals/{dealId}/inspect")
    public ApiResponse<Map<String, Object>> inspectDeal(@PathVariable Long dealId) {
        return ApiResponse.success(revenueService.inspectDeal(dealId));
    }

    @Operation(summary = "获取管道阶段基准配置")
    @GetMapping("/configs")
    public ApiResponse<List<AiRevenueConfig>> getConfigs() {
        return ApiResponse.success(revenueService.getAllRevenueConfigs());
    }

    @Operation(summary = "更新管道阶段基准配置")
    @PutMapping("/configs/{id}")
    public ApiResponse<AiRevenueConfig> updateConfig(@PathVariable Long id, @RequestBody AiRevenueConfig config) {
        return ApiResponse.success(revenueService.updateRevenueConfig(id, config));
    }
}

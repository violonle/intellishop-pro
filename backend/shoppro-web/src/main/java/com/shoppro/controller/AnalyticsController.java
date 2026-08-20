package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * 数据分析控制器
 * 提供仪表板统计、多维度分析、趋势预测和报表生成的REST API
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/analytics")
@Tag(name = "数据分析", description = "仪表板、分析报告、趋势预测等数据分析功能")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;
    private final com.shoppro.service.AiService aiService;

    public AnalyticsController(AnalyticsService analyticsService, com.shoppro.service.AiService aiService) {
        this.analyticsService = analyticsService;
        this.aiService = aiService;
    }

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    // ========== 仪表板统计 ==========

    /**
     * 获取销售仪表板数据
     */
    @GetMapping("/dashboard/sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售仪表板数据")
    public ApiResponse<Map<String, Object>> getSalesDashboard() {
        try {
            Map<String, Object> data = analyticsService.getSalesDashboard();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售仪表板数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取客户仪表板数据
     */
    @GetMapping("/dashboard/customer")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取客户仪表板数据")
    public ApiResponse<Map<String, Object>> getCustomerDashboard() {
        try {
            Map<String, Object> data = analyticsService.getCustomerDashboard();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取客户仪表板数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取业绩仪表板数据
     */
    @GetMapping("/dashboard/performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "获取业绩仪表板数据")
    public ApiResponse<Map<String, Object>> getPerformanceDashboard() {
        try {
            Map<String, Object> data = analyticsService.getPerformanceDashboard();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取业绩仪表板数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取产品仪表板数据
     */
    @GetMapping("/dashboard/product")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "获取产品仪表板数据")
    public ApiResponse<Map<String, Object>> getProductDashboard() {
        try {
            Map<String, Object> data = analyticsService.getProductDashboard();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取产品仪表板数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    // ========== 销售分析 ==========

    /**
     * 获取销售趋势分析
     */
    @GetMapping("/sales/trend")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售趋势分析")

    public ApiResponse<Map<String, Object>> getSalesTrend(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "day") String granularity) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
            Map<String, Object> data = analyticsService.getSalesTrend(start, end, granularity);
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售趋势分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售排名统计
     */
    @GetMapping("/sales/ranking")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售排名统计")

    public ApiResponse<Map<String, Object>> getSalesRanking(
            @RequestParam(defaultValue = "sales") String dimension,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> data = analyticsService.getSalesRanking(dimension, limit);
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售排名统计失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售渠道分析
     */
    @GetMapping("/sales/channel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取销售渠道分析")
    public ApiResponse<Map<String, Object>> getSalesChannelAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getSalesChannelAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售渠道分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售人员业绩排名
     */
    @GetMapping("/sales/person-ranking")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售人员业绩排名")

    public ApiResponse<List<Map<String, Object>>> getSalesPersonRanking(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> data = analyticsService.getSalesPersonRanking(limit);
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售人员业绩排名失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售团队AI分析洞察
     */
    @PostMapping("/sales/team-insight")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售团队AI分析洞察")
    public ApiResponse<String> getSalesTeamInsight() {
        try {
            // 1. 获取最近的销售排名数据
            List<Map<String, Object>> rankingData = analyticsService.getSalesPersonRanking(20);

            // 2. 调用 AI 服务进行分析
            String insight = aiService.generateSalesTeamInsight(rankingData);
            return ApiResponse.success(insight, "获取成功");
        } catch (Exception e) {
            log.error("获取销售团队AI分析洞察失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取高级分析页面综合数据
     */
    @GetMapping("/advanced-data")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取高级分析页面综合数据")
    public ApiResponse<Map<String, Object>> getAdvancedData(
            @RequestParam(defaultValue = "30") String timeRange) {
        try {
            Map<String, Object> data = analyticsService.getAdvancedAnalyticsData(timeRange);
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取高级分析数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售高级分析AI智能洞察
     */
    @PostMapping("/sales/analytics-insight")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售高级分析AI智能洞察")
    public ApiResponse<String> getSalesAnalyticsInsight(
            @RequestParam(defaultValue = "30") String timeRange) {
        try {
            // 1. 获取高级分析基础数据
            Map<String, Object> data = analyticsService.getAdvancedAnalyticsData(timeRange);

            // 2. 调用 AI 服务进行分析
            String insight = aiService.generateSalesAnalyticsInsight(data);
            return ApiResponse.success(insight, "获取成功");
        } catch (Exception e) {
            log.error("获取高级分析AI洞察失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售行为深度分析
     */
    @GetMapping("/sales/behavior")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取销售行为深度分析")
    public ApiResponse<Map<String, Object>> getSalesBehaviorAnalysis(
            @RequestParam(required = false) Long userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
            Map<String, Object> data = analyticsService.getSalesBehaviorAnalysis(userId, start, end);
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售行为分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取销售漏斗分析
     */
    @GetMapping("/sales/funnel")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取销售漏斗分析")
    public ApiResponse<Map<String, Object>> getSalesFunnelAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getSalesFunnelAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取销售漏斗分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    // ========== 客户分析 ==========

    /**
     * 获取客户生命周期分析
     */
    @GetMapping("/customer/lifecycle")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取客户生命周期分析")
    public ApiResponse<Map<String, Object>> getCustomerLifecycleAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getCustomerLifecycleAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取客户生命周期分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取客户价值分析
     */
    @GetMapping("/customer/value")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取客户价值分析")
    public ApiResponse<Map<String, Object>> getCustomerValueAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getCustomerValueAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取客户价值分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取客户行为分析
     */
    @GetMapping("/customer/behavior")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取客户行为分析")
    public ApiResponse<Map<String, Object>> getCustomerBehaviorAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getCustomerBehaviorAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取客户行为分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取客户流失分析
     */
    @GetMapping("/customer/churn")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取客户流失分析")
    public ApiResponse<Map<String, Object>> getCustomerChurnAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getCustomerChurnAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取客户流失分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取客户分布分析
     */
    @GetMapping("/customer/distribution")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取客户分布分析")
    public ApiResponse<Map<String, Object>> getCustomerDistributionAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getCustomerDistributionAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取客户分布分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    // ========== 产品分析 ==========

    /**
     * 获取产品热销分析
     */
    @GetMapping("/product/popularity")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取产品热销分析")
    public ApiResponse<Map<String, Object>> getProductPopularityAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getProductPopularityAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取产品热销分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取产品库存分析
     */
    @GetMapping("/product/inventory")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取产品库存分析")
    public ApiResponse<Map<String, Object>> getProductInventoryAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getProductInventoryAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取产品库存分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取产品毛利分析
     */
    @GetMapping("/product/profit")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取产品毛利分析")
    public ApiResponse<Map<String, Object>> getProductProfitAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getProductProfitAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取产品毛利分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取产品分类销售分析
     */
    @GetMapping("/product/category-sales")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取产品分类销售分析")
    public ApiResponse<Map<String, Object>> getProductCategorySalesAnalysis() {
        try {
            Map<String, Object> data = analyticsService.getProductCategorySalesAnalysis();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取产品分类销售分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    // ========== 趋势预测 ==========

    /**
     * 预测销售趋势
     */
    @GetMapping("/predict/sales-trend")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "预测销售趋势")

    public ApiResponse<Map<String, Object>> predictSalesTrend(
            @RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> data = analyticsService.predictSalesTrend(days);
            return ApiResponse.success(data, "预测成功");
        } catch (Exception e) {
            log.error("预测销售趋势失败", e);
            return ApiResponse.error("预测失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 预测客户流失
     */
    @GetMapping("/predict/customer-churn")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "预测客户流失")
    public ApiResponse<List<Map<String, Object>>> predictCustomerChurn() {
        try {
            List<Map<String, Object>> data = analyticsService.predictCustomerChurn();
            return ApiResponse.success(data, "预测成功");
        } catch (Exception e) {
            log.error("预测客户流失失败", e);
            return ApiResponse.error("预测失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 预测库存需求
     */
    @GetMapping("/predict/inventory-demand")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "预测库存需求")
    public ApiResponse<Map<String, Object>> predictInventoryDemand() {
        try {
            Map<String, Object> data = analyticsService.predictInventoryDemand();
            return ApiResponse.success(data, "预测成功");
        } catch (Exception e) {
            log.error("预测库存需求失败", e);
            return ApiResponse.error("预测失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 预测成交概率
     */
    @GetMapping("/predict/conversion-rate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "预测成交概率")
    public ApiResponse<Map<String, Object>> predictConversionRate() {
        try {
            Map<String, Object> data = analyticsService.predictConversionRate();
            return ApiResponse.success(data, "预测成功");
        } catch (Exception e) {
            log.error("预测成交概率失败", e);
            return ApiResponse.error("预测失败: " + e.getMessage(), 500);
        }
    }

    // ========== 对比分析 ==========

    /**
     * 年度对比分析
     */
    @GetMapping("/comparison/year")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "年度对比分析")
    public ApiResponse<Map<String, Object>> getYearOverYearComparison() {
        try {
            Map<String, Object> data = analyticsService.getYearOverYearComparison();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("年度对比分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 月度对比分析
     */
    @GetMapping("/comparison/month-over-month")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "月度对比分析")
    public ApiResponse<Map<String, Object>> getMonthOverMonthComparison() {
        log.error("DEBUG: 进入 getMonthOverMonthComparison 方法");
        try {
            Map<String, Object> data = analyticsService.getMonthOverMonthComparison();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("月度对比分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 销售人员对比分析
     */
    @GetMapping("/comparison/sales-person")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "销售人员对比分析")
    public ApiResponse<Map<String, Object>> getSalesPersonComparison() {
        try {
            Map<String, Object> data = analyticsService.getSalesPersonComparison();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("销售人员对比分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 产品对比分析
     */
    @GetMapping("/comparison/product")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "产品对比分析")
    public ApiResponse<Map<String, Object>> getProductComparison() {
        try {
            Map<String, Object> data = analyticsService.getProductComparison();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("产品对比分析失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    // ========== 报表生成 ==========

    /**
     * 生成销售报表
     */
    @GetMapping("/report/sales")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "生成销售报表")

    public ResponseEntity<Resource> generateSalesReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
            byte[] report = analyticsService.generateSalesReport(start, end);

            String filename = "sales_report_" + System.currentTimeMillis() + ".json";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(report));
        } catch (Exception e) {
            log.error("生成销售报表失败", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 生成客户报表
     */
    @GetMapping("/report/customer")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "生成客户报表")
    public ResponseEntity<Resource> generateCustomerReport() {
        try {
            byte[] report = analyticsService.generateCustomerReport();

            String filename = "customer_report_" + System.currentTimeMillis() + ".json";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(report));
        } catch (Exception e) {
            log.error("生成客户报表失败", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 生成产品报表
     */
    @GetMapping("/report/product")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "生成产品报表")
    public ResponseEntity<Resource> generateProductReport() {
        try {
            byte[] report = analyticsService.generateProductReport();

            String filename = "product_report_" + System.currentTimeMillis() + ".json";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(report));
        } catch (Exception e) {
            log.error("生成产品报表失败", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 生成业绩报表
     */
    @GetMapping("/report/performance")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "生成业绩报表")

    public ResponseEntity<Resource> generatePerformanceReport(
            @RequestParam(required = false) Long userId) {
        try {
            byte[] report = analyticsService.generatePerformanceReport(userId);

            String filename = "performance_report_" + System.currentTimeMillis() + ".json";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(report));
        } catch (Exception e) {
            log.error("生成业绩报表失败", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 生成综合报表
     */
    @GetMapping("/report/comprehensive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    @Operation(summary = "生成综合报表")
    public ResponseEntity<Resource> generateComprehensiveReport(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate, DATE_FORMATTER);
            LocalDate end = LocalDate.parse(endDate, DATE_FORMATTER);
            byte[] report = analyticsService.generateComprehensiveReport(start, end);

            String filename = "comprehensive_report_" + System.currentTimeMillis() + ".json";
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(new ByteArrayResource(report));
        } catch (Exception e) {
            log.error("生成综合报表失败", e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 获取异常预警数据
     */
    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    @Operation(summary = "获取异常预警数据")
    public ApiResponse<List<Map<String, Object>>> getAnomalyAlerts() {
        try {
            List<Map<String, Object>> data = analyticsService.getAnomalyAlerts();
            return ApiResponse.success(data, "获取成功");
        } catch (Exception e) {
            log.error("获取异常预警数据失败", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }
}

package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.dto.response.CustomerProfileResponse;
import com.shoppro.dto.response.ScriptGenerationResponse;
import com.shoppro.dto.response.SalesPredictionResponse;
import com.shoppro.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import com.shoppro.service.AnalyticsService;

/**
 * AI 服务控制器
 */
@Tag(name = "AI Service", description = "AI 辅助分析与生成接口")
@RestController
@RequestMapping("/ai")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class AiController {

    private final AiService aiService;

    private final com.shoppro.service.AiScenarioService aiScenarioService;
    private final com.shoppro.service.SalesScriptService salesScriptService;
    private final com.shoppro.service.CustomerPersonaService customerPersonaService;

    public AiController(AiService aiService,
            com.shoppro.service.AiScenarioService aiScenarioService,
            com.shoppro.service.SalesScriptService salesScriptService,
            com.shoppro.service.CustomerPersonaService customerPersonaService) {
        this.aiService = aiService;
        this.aiScenarioService = aiScenarioService;
        this.salesScriptService = salesScriptService;
        this.customerPersonaService = customerPersonaService;
    }

    @Operation(summary = "客户画像分析(旧版)")
    @PostMapping("/customer-profile")
    public ApiResponse<CustomerProfileResponse> analyzeCustomerProfile(@RequestBody Map<String, Object> customerData) {
        return ApiResponse.success(aiService.analyzeCustomerProfile(customerData));
    }

    @Operation(summary = "营销话术生成(旧版)")
    @PostMapping("/generate-script")
    public ApiResponse<ScriptGenerationResponse> generateScript(@RequestBody Map<String, Object> context) {
        return ApiResponse.success(aiService.generateMarketingScript(context));
    }

    @Operation(summary = "销售预测分析")
    @PostMapping("/sales-prediction")
    public ApiResponse<SalesPredictionResponse> predictSales(@RequestBody Map<String, Object> historicalData) {
        return ApiResponse.success(aiService.predictSalesStructured(historicalData));
    }

    @Operation(summary = "获取 AI 评分线索列表")
    @GetMapping("/leads")
    public ApiResponse<java.util.List<Map<String, Object>>> getAiLeads() {
        return ApiResponse.success(aiService.getAiScoredLeads());
    }

    // --- New Endpoints ---

    @Operation(summary = "获取所有 AI 场景配置")
    @GetMapping("/scenarios/list")
    public ApiResponse<java.util.List<com.shoppro.entity.AiScenario>> getScenarios() {
        return ApiResponse.success(aiScenarioService.list());
    }

    @Operation(summary = "更新场景分类模型配置")
    @PutMapping("/scenarios/category")
    public ApiResponse<Void> updateCategoryModel(@RequestBody Map<String, String> request) {
        String category = request.get("category");
        String modelName = request.get("model");
        if (category == null || modelName == null) {
            return ApiResponse.error("Missing category or model", 400);
        }
        aiScenarioService.updateCategoryModel(category, modelName);
        return ApiResponse.success(null);
    }

    @Operation(summary = "获取话术列表")
    @GetMapping("/scripts")
    public ApiResponse<java.util.List<com.shoppro.entity.SalesScript>> getScripts(
            @RequestParam(required = false) String category) {
        return ApiResponse.success(salesScriptService.getScriptsByCategory(category));
    }

    @Operation(summary = "创建新话术")
    @PostMapping("/scripts")
    public ApiResponse<Boolean> createScript(@RequestBody com.shoppro.entity.SalesScript script) {
        script.setCreatedAt(java.time.LocalDateTime.now());
        script.setUpdatedAt(java.time.LocalDateTime.now());
        return ApiResponse.success(salesScriptService.save(script));
    }

    @Operation(summary = "获取所有客户画像列表")
    @GetMapping("/personas")
    public ApiResponse<java.util.List<Map<String, Object>>> getPersonas() {
        return ApiResponse.success(customerPersonaService.getPersonas());
    }

    @Operation(summary = "获取客户画像详情")
    @GetMapping("/personas/{id}")
    public ApiResponse<Map<String, Object>> getPersonaDetail(@PathVariable Long id) {
        return ApiResponse.success(customerPersonaService.getPersonaDetail(id));
    }

    @Operation(summary = "获取实时决策建议")
    @GetMapping("/insights")
    public ApiResponse<java.util.List<String>> getInsights() {
        java.util.List<String> insights = new java.util.ArrayList<>();

        // 1. Check current customer persona data
        long personaCount = customerPersonaService.count();
        if (personaCount > 0) {
            insights.add("新增 " + personaCount + " 位高潜客户画像，建议查看并分配销售跟进");
        }

        // 2. Check scripts
        long scriptCount = salesScriptService.count();
        insights.add(scriptCount < 10
                ? "当前话术库较少（" + scriptCount + "条），建议补充更多高转化话术"
                : "话术库更新活跃，可继续维护高频使用话术");

        return ApiResponse.success(insights);
    }

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private com.shoppro.service.LeadService leadService;

    @Operation(summary = "获取大脑概况数据")
    @GetMapping("/brain/stats")
    public ApiResponse<Map<String, Object>> getBrainStats() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("scriptCount", salesScriptService.count());
        stats.put("personaCount", customerPersonaService.count());
        stats.put("scenarioCount", aiScenarioService.count());
        stats.put("activeScenarios", aiScenarioService.getEnabledScenarios().size());

        // Real Data Metrics
        // 1. User Persona Engine
        stats.put("newPersonasCount", customerPersonaService.countNewPersonasToday());
        stats.put("personaAccuracy", null);

        // 2. Leads Engine - Real Data
        long totalLeads = leadService.listLeads(1, 100, java.util.Map.of()).getTotal();
        long highIntentCount = leadService.listLeads(1, 100,
                java.util.Map.of("minProbability", 80)).getTotal();
        stats.put("leadsEvaluated", totalLeads);
        stats.put("leadsHighIntent", highIntentCount);
        stats.put("leadsAccuracy", null);

        // 3. Alert Engine - Real Data
        List<Map<String, Object>> alerts = analyticsService.getAnomalyAlerts();
        stats.put("alertRisks", alerts.size());
        stats.put("alertHighRiskCustomers", alerts.stream().filter(a -> "high".equals(a.get("severity"))).count());
        stats.put("alertRecall", null);

        return ApiResponse.success(stats);
    }

    @Operation(summary = "通用 AI 对话")
    @PostMapping("/chat")
    public ApiResponse<String> chat(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.get("context");
        return ApiResponse.success(aiService.chat(message, context));
    }
}

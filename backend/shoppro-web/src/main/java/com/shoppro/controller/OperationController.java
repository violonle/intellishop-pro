package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AutomationRule;
import com.shoppro.entity.SopAudit;
import com.shoppro.entity.SopTemplate;
import com.shoppro.entity.WorkTask;
import com.shoppro.service.OperationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * Operation Controller
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@RestController
@RequestMapping("/operation")
@Tag(name = "客户运营", description = "SOP、待办任务")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
public class OperationController {

    private final OperationService operationService;

    public OperationController(OperationService operationService) {
        this.operationService = operationService;
    }

    // --- Automation Rules ---
    @GetMapping("/automation-rule")
    @Operation(summary = "获取自动化规则列表")
    public ApiResponse<List<AutomationRule>> listAutomationRules(
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) String triggerEvent,
            @RequestParam(required = false) Boolean isActive) {
        Long targetId = resolveTenantId(tenantId);
        return ApiResponse.success(operationService.listAutomationRules(targetId, triggerEvent, isActive));
    }

    @PostMapping("/automation-rule")
    @Operation(summary = "创建自动化规则")
    public ApiResponse<AutomationRule> createAutomationRule(@RequestBody AutomationRule rule) {
        Long tenantId = com.shoppro.util.SecurityUtils.getLoginUser().getUser().getEnterpriseId();
        rule.setTenantId(tenantId);
        return ApiResponse.success(operationService.createAutomationRule(rule));
    }

    @PutMapping("/automation-rule/{id}")
    @Operation(summary = "更新自动化规则")
    public ApiResponse<AutomationRule> updateAutomationRule(@PathVariable Long id, @RequestBody AutomationRule rule) {
        return ApiResponse.success(operationService.updateAutomationRule(id, rule));
    }

    @DeleteMapping("/automation-rule/{id}")
    @Operation(summary = "删除自动化规则")
    public ApiResponse<Void> deleteAutomationRule(@PathVariable Long id) {
        operationService.deleteAutomationRule(id);
        return ApiResponse.success(null);
    }

    @PutMapping("/automation-rule/{id}/toggle")
    @Operation(summary = "切换自动化规则状态")
    public ApiResponse<AutomationRule> toggleAutomationRule(@PathVariable Long id) {
        return ApiResponse.success(operationService.toggleAutomationRule(id));
    }

    // --- SOP Templates ---
    @GetMapping("/sop")
    @Operation(summary = "获取SOP模板列表")
    public ApiResponse<List<SopTemplate>> listSopTemplates(@RequestParam(required = false) Long tenantId) {
        Long targetId = resolveTenantId(tenantId);
        return ApiResponse.success(operationService.listSopTemplates(targetId));
    }

    @PostMapping("/sop")
    @Operation(summary = "创建SOP模板")
    public ApiResponse<SopTemplate> createSopTemplate(@RequestBody SopTemplate sopTemplate) {
        return ApiResponse.success(operationService.createSopTemplate(sopTemplate));
    }

    @PutMapping("/sop/{id}")
    @Operation(summary = "更新SOP模板")
    public ApiResponse<SopTemplate> updateSopTemplate(@PathVariable Long id, @RequestBody SopTemplate sopTemplate) {
        return ApiResponse.success(operationService.updateSopTemplate(id, sopTemplate));
    }

    @DeleteMapping("/sop/{id}")
    @Operation(summary = "删除SOP模板")
    public ApiResponse<Void> deleteSopTemplate(@PathVariable Long id) {
        operationService.deleteSopTemplate(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/sop/apply")
    @Operation(summary = "应用SOP到客户")
    public ApiResponse<Void> applySopToCustomer(@RequestParam Long customerId, @RequestParam Long sopTemplateId) {
        operationService.applySopToCustomer(customerId, sopTemplateId);
        return ApiResponse.success(null);
    }

    // --- Work Tasks ---
    @GetMapping("/tasks")
    @Operation(summary = "获取待办任务列表")
    public ApiResponse<List<WorkTask>> listWorkTasks(@RequestParam Long userId,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(operationService.listWorkTasks(userId, status));
    }

    @PostMapping("/tasks")
    @Operation(summary = "创建待办任务")
    public ApiResponse<WorkTask> createWorkTask(@RequestBody WorkTask workTask) {
        return ApiResponse.success(operationService.createWorkTask(workTask));
    }

    @PutMapping("/tasks/{id}/complete")
    @Operation(summary = "完成待办任务")
    public ApiResponse<Void> completeWorkTask(@PathVariable Long id) {
        operationService.completeWorkTask(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/sop/export")
    @Operation(summary = "导出SOP执行审计报表")
    public org.springframework.http.ResponseEntity<String> exportSopAudit(
            @RequestParam(required = false) Long tenantId) {
        Long targetId = resolveTenantId(tenantId);
        String csv = operationService.exportSopAudit(targetId);
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sop_audit.csv")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/sop/audit/list")
    @Operation(summary = "获取SOP执行审计列表")
    public ApiResponse<Map<String, Object>> listSopAudits(
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String ruleName,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long targetId = resolveTenantId(tenantId);
        
        List<SopAudit> records = operationService.listSopAudits(targetId, status, ruleName, page, size);
        long total = operationService.countSopAudits(targetId, status, ruleName);
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        
        return ApiResponse.success(result);
    }

    private Long resolveTenantId(Long requestedTenantId) {
        boolean platform = com.shoppro.util.SecurityUtils.getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> java.util.Set.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_PLATFORM_ADMIN")
                        .contains(authority.getAuthority()));
        if (platform && requestedTenantId != null) return requestedTenantId;
        if (com.shoppro.util.SecurityUtils.getLoginUser() == null
                || com.shoppro.util.SecurityUtils.getLoginUser().getUser() == null
                || com.shoppro.util.SecurityUtils.getLoginUser().getUser().getEnterpriseId() == null) {
            throw new IllegalStateException("当前用户未绑定企业");
        }
        return com.shoppro.util.SecurityUtils.getLoginUser().getUser().getEnterpriseId();
    }
}

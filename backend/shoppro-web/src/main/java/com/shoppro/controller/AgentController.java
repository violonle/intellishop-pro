package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AiAgentConfig;
import com.shoppro.entity.AiAgentTask;
import com.shoppro.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "AI Sales Agent", description = "AI 销售智能体管理与工作台")
@RestController
@RequestMapping("/ai/agents")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @Operation(summary = "获取智能体概览与汇总")
    @GetMapping("/summary")
    public ApiResponse<Map<String, Object>> getSummary() {
        return ApiResponse.success(agentService.getAgentsSummary());
    }

    @Operation(summary = "获取所有智能体配置列表")
    @GetMapping("/configs")
    public ApiResponse<List<AiAgentConfig>> getAllConfigs() {
        return ApiResponse.success(agentService.getAllAgentConfigs());
    }

    @Operation(summary = "更新智能体配置")
    @PutMapping("/configs/{agentType}")
    public ApiResponse<AiAgentConfig> updateConfig(@PathVariable String agentType, @RequestBody AiAgentConfig config) {
        return ApiResponse.success(agentService.updateAgentConfig(agentType, config));
    }

    @Operation(summary = "获取指定智能体类型的任务列表")
    @GetMapping("/tasks")
    public ApiResponse<List<AiAgentTask>> getTasks(
            @RequestParam(required = false, defaultValue = "all") String agentType,
            @RequestParam(required = false, defaultValue = "all") String status) {
        return ApiResponse.success(agentService.getTasksByAgentType(agentType, status));
    }

    @Operation(summary = "获取单个任务详情")
    @GetMapping("/tasks/{id}")
    public ApiResponse<AiAgentTask> getTaskById(@PathVariable Long id) {
        return ApiResponse.success(agentService.getTaskById(id));
    }

    @Operation(summary = "确认执行智能体任务")
    @PostMapping("/tasks/{id}/confirm")
    public ApiResponse<Boolean> confirmTask(@PathVariable Long id) {
        return ApiResponse.success(agentService.confirmTask(id));
    }

    @Operation(summary = "驳回智能体任务")
    @PostMapping("/tasks/{id}/reject")
    public ApiResponse<Boolean> rejectTask(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String feedback = body != null ? body.get("feedback") : "方案不符合要求";
        return ApiResponse.success(agentService.rejectTask(id, feedback));
    }

    @Operation(summary = "获取全量智能体执行日志(管理端)")
    @GetMapping("/logs")
    public ApiResponse<List<AiAgentTask>> getLogs(
            @RequestParam(required = false, defaultValue = "all") String agentType,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(agentService.getAllTaskLogs(agentType, status, pageNo, pageSize));
    }
}

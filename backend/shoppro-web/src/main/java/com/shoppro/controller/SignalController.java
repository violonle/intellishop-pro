package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AiSignal;
import com.shoppro.entity.AiSignalType;
import com.shoppro.entity.AiTriggerRule;
import com.shoppro.service.SignalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Signal & Trigger Engine", description = "智能信号流与自动化触发规则")
@RestController
@RequestMapping("/ai")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES')")
public class SignalController {

    private final SignalService signalService;

    public SignalController(SignalService signalService) {
        this.signalService = signalService;
    }

    @Operation(summary = "分页获取实时信号流")
    @GetMapping("/signals")
    public ApiResponse<List<AiSignal>> getSignals(
            @RequestParam(required = false) Long salesId,
            @RequestParam(required = false, defaultValue = "all") String signalType,
            @RequestParam(required = false) Integer isHandled,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ApiResponse.success(signalService.getSignals(salesId, signalType, isHandled, pageNo, pageSize));
    }

    @Operation(summary = "获取信号详情")
    @GetMapping("/signals/{id}")
    public ApiResponse<AiSignal> getSignalById(@PathVariable Long id) {
        return ApiResponse.success(signalService.getSignalById(id));
    }

    @Operation(summary = "标记信号为已处理")
    @PostMapping("/signals/{id}/handle")
    public ApiResponse<Boolean> handleSignal(@PathVariable Long id) {
        return ApiResponse.success(signalService.handleSignal(id));
    }

    @Operation(summary = "获取信号流统计数据")
    @GetMapping("/signals/stats")
    public ApiResponse<Map<String, Object>> getSignalStats() {
        return ApiResponse.success(signalService.getSignalStats());
    }

    @Operation(summary = "获取指定客户/线索的信号历史时间线")
    @GetMapping("/signals/target")
    public ApiResponse<List<AiSignal>> getSignalsByTarget(
            @RequestParam String targetType,
            @RequestParam Long targetId) {
        return ApiResponse.success(signalService.getSignalsByTarget(targetType, targetId));
    }

    // --- Signal Types ---
    @Operation(summary = "获取所有信号类型配置")
    @GetMapping("/signal-types")
    public ApiResponse<List<AiSignalType>> getAllSignalTypes() {
        return ApiResponse.success(signalService.getAllSignalTypes());
    }

    @Operation(summary = "保存或更新信号类型")
    @PostMapping("/signal-types")
    public ApiResponse<AiSignalType> saveSignalType(@RequestBody AiSignalType type) {
        return ApiResponse.success(signalService.createOrUpdateSignalType(type));
    }

    @Operation(summary = "删除信号类型")
    @DeleteMapping("/signal-types/{id}")
    public ApiResponse<Boolean> deleteSignalType(@PathVariable Long id) {
        return ApiResponse.success(signalService.deleteSignalType(id));
    }

    // --- Trigger Rules ---
    @Operation(summary = "获取所有自动化触发规则")
    @GetMapping("/trigger-rules")
    public ApiResponse<List<AiTriggerRule>> getAllTriggerRules() {
        return ApiResponse.success(signalService.getAllTriggerRules());
    }

    @Operation(summary = "保存或更新触发规则")
    @PostMapping("/trigger-rules")
    public ApiResponse<AiTriggerRule> saveTriggerRule(@RequestBody AiTriggerRule rule) {
        return ApiResponse.success(signalService.createOrUpdateTriggerRule(rule));
    }

    @Operation(summary = "删除触发规则")
    @DeleteMapping("/trigger-rules/{id}")
    public ApiResponse<Boolean> deleteTriggerRule(@PathVariable Long id) {
        return ApiResponse.success(signalService.deleteTriggerRule(id));
    }
}

package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AiModel;
import com.shoppro.service.AiModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "AI Model Management", description = "大模型配置接入管理")
@RestController
@RequestMapping("/ai-models")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN')")
public class AiModelManagementController {

    private final AiModelService aiModelService;

    public AiModelManagementController(AiModelService aiModelService) {
        this.aiModelService = aiModelService;
    }

    @Operation(summary = "获取所有模型列表")
    @GetMapping
    public ApiResponse<List<AiModel>> getAllModels() {
        return ApiResponse.success(aiModelService.getAllModels());
    }

    @Operation(summary = "接入新模型")
    @PostMapping
    public ApiResponse<AiModel> createModel(@RequestBody AiModel model) {
        return ApiResponse.success(aiModelService.createModel(model));
    }

    @Operation(summary = "更新模型配置")
    @PutMapping("/{id}")
    public ApiResponse<AiModel> updateModel(@PathVariable Long id, @RequestBody AiModel model) {
        return ApiResponse.success(aiModelService.updateModel(id, model));
    }

    @Operation(summary = "切换模型状态")
    @PutMapping("/{id}/status")
    public ApiResponse<Void> toggleStatus(@PathVariable Long id) {
        aiModelService.toggleStatus(id);
        return ApiResponse.success(null);
    }

    @Operation(summary = "删除模型")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteModel(@PathVariable Long id) {
        aiModelService.deleteModel(id);
        return ApiResponse.success(null);
    }
}

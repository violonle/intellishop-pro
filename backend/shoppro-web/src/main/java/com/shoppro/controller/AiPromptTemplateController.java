package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AiPromptTemplate;
import com.shoppro.service.AiPromptTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "AI Prompt Template", description = "AI 提示词模板管理")
@RestController
@RequestMapping("/ai/prompt-templates")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
public class AiPromptTemplateController {

    private final AiPromptTemplateService promptTemplateService;

    public AiPromptTemplateController(AiPromptTemplateService promptTemplateService) {
        this.promptTemplateService = promptTemplateService;
    }

    @Operation(summary = "获取所有模板列表")
    @GetMapping
    public ApiResponse<List<AiPromptTemplate>> list() {
        return ApiResponse.success(promptTemplateService.list());
    }

    @Operation(summary = "获取模板详情")
    @GetMapping("/{id}")
    public ApiResponse<AiPromptTemplate> get(@PathVariable Long id) {
        return ApiResponse.success(promptTemplateService.getById(id));
    }

    @Operation(summary = "创建模板")
    @PostMapping
    public ApiResponse<Boolean> create(@RequestBody AiPromptTemplate template) {
        return ApiResponse.success(promptTemplateService.save(template));
    }

    @Operation(summary = "更新模板")
    @PutMapping("/{id}")
    public ApiResponse<Boolean> update(@PathVariable Long id, @RequestBody AiPromptTemplate template) {
        template.setId(id);
        return ApiResponse.success(promptTemplateService.updateById(template));
    }

    @Operation(summary = "删除模板")
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> delete(@PathVariable Long id) {
        return ApiResponse.success(promptTemplateService.removeById(id));
    }
}

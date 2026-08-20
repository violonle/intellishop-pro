package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.AiCoachingRule;
import com.shoppro.entity.AiConversation;
import com.shoppro.service.ConversationIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Conversation Intelligence", description = "会话智能分析与实时辅导")
@RestController
@RequestMapping("/ai")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class ConversationIntelligenceController {

    private final ConversationIntelligenceService conversationService;

    public ConversationIntelligenceController(ConversationIntelligenceService conversationService) {
        this.conversationService = conversationService;
    }

    @Operation(summary = "分页获取会话沟通记录")
    @GetMapping("/conversations")
    public ApiResponse<List<AiConversation>> getConversations(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long salesId,
            @RequestParam(required = false, defaultValue = "all") String sentiment,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ApiResponse.success(conversationService.getConversations(customerId, salesId, sentiment, pageNo, pageSize));
    }

    @Operation(summary = "获取会话记录详情")
    @GetMapping("/conversations/{id}")
    public ApiResponse<AiConversation> getConversationById(@PathVariable Long id) {
        return ApiResponse.success(conversationService.getConversationById(id));
    }

    @Operation(summary = "提交会话记录并执行AI深度分析")
    @PostMapping("/conversations")
    public ApiResponse<AiConversation> createConversation(@RequestBody AiConversation conversation) {
        return ApiResponse.success(conversationService.createAndAnalyzeConversation(conversation));
    }

    @Operation(summary = "获取实时通话耳语辅导建议")
    @PostMapping("/coaching/advice")
    public ApiResponse<Map<String, Object>> getCoachingAdvice(@RequestBody(required = false) Map<String, Object> params) {
        if (params == null || params.get("customerId") == null) {
            throw new IllegalArgumentException("customerId 不能为空");
        }
        Long customerId = Long.valueOf(params.get("customerId").toString());
        String keywords = params != null && params.get("keywords") != null ? params.get("keywords").toString() : "";
        return ApiResponse.success(conversationService.getLiveCoachingAdvice(customerId, keywords));
    }

    @Operation(summary = "获取所有辅导规则")
    @GetMapping("/coaching/rules")
    public ApiResponse<List<AiCoachingRule>> getAllCoachingRules() {
        return ApiResponse.success(conversationService.getAllCoachingRules());
    }

    @Operation(summary = "保存或更新辅导规则")
    @PostMapping("/coaching/rules")
    public ApiResponse<AiCoachingRule> saveCoachingRule(@RequestBody AiCoachingRule rule) {
        return ApiResponse.success(conversationService.createOrUpdateCoachingRule(rule));
    }

    @Operation(summary = "删除辅导规则")
    @DeleteMapping("/coaching/rules/{id}")
    public ApiResponse<Boolean> deleteCoachingRule(@PathVariable Long id) {
        return ApiResponse.success(conversationService.deleteCoachingRule(id));
    }
}

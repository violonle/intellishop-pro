package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.*;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Customer;
import com.shoppro.entity.Lead;
import com.shoppro.service.LeadService;
import com.shoppro.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 销售线索管理控制器
 * 提供线索的CRUD、搜索、分配、转客户等接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/leads")
@Tag(name = "销售线索管理", description = "线索的增删改查、搜索、分配、转客户等功能")
public class LeadController {

    private static final Logger log = LoggerFactory.getLogger(LeadController.class);

    private final LeadService leadService;

    public LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    /**
     * 分页查询线索列表
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "分页查询线索列表")
    public ApiResponse<Page<Lead>> list(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) BigDecimal minValue,
            @RequestParam(required = false) BigDecimal maxValue,
            @RequestParam(required = false) Integer minProbability,
            @RequestParam(required = false) Integer maxProbability) {
    
        Map<String, Object> filters = new HashMap<>();
        if (priority != null) filters.put("priority", priority);
        if (status != null) filters.put("status", status);
        if (assignedTo != null) filters.put("assignedTo", assignedTo);
        if (source != null) filters.put("source", source);
        if (stage != null) filters.put("stage", stage);
        if (minValue != null) filters.put("minValue", minValue);
        if (maxValue != null) filters.put("maxValue", maxValue);
        if (minProbability != null) filters.put("minProbability", minProbability);
        if (maxProbability != null) filters.put("maxProbability", maxProbability);
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
    
        Page<Lead> result = leadService.listLeads(normalizedPageNo, normalizedPageSize, filters);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 搜索线索
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "全文搜索线索")
    public ApiResponse<Page<Lead>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
    
        Page<Lead> result = leadService.searchLeads(keyword, normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "搜索成功");
    }

    /**
     * 获取线索详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取线索详情")
    public ApiResponse<Lead> getDetail(@PathVariable Long id) {
        Lead lead = leadService.getLeadDetail(id);
        return ApiResponse.success(lead, "获取成功");
    }

    /**
     * 创建线索
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "创建线索")
    public ApiResponse<Lead> create(@Valid @RequestBody LeadCreateDTO dto) {
        // 转换DTO为Entity
        Lead lead = new Lead();
        lead.setTitle(dto.getTitle());
        lead.setDescription(dto.getDescription());
        lead.setCustomerId(dto.getCustomerId());
        lead.setSource(dto.getSource());
        lead.setPriority(dto.getPriority());
        lead.setEstimatedValue(dto.getEstimatedValue());
        lead.setInterestedProducts(dto.getInterestedProducts());
        lead.setBudgetRange(dto.getBudgetRange());
        lead.setDecisionTimeline(dto.getDecisionTimeline());
        lead.setCompetitorInfo(dto.getCompetitorInfo());
        lead.setAssignedTo(dto.getAssignedTo());

        if (dto.getFollowUpDate() != null && !dto.getFollowUpDate().isEmpty()) {
            lead.setFollowUpDate(LocalDate.parse(dto.getFollowUpDate()));
        }

        Long currentUserId = getCurrentUserId();
        Lead result = leadService.createLead(lead, currentUserId);
        return ApiResponse.success(result, "创建成功");
    }

    /**
     * 更新线索
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "更新线索")
    public ApiResponse<Lead> update(@PathVariable Long id, @Valid @RequestBody LeadUpdateDTO dto) {
        // 转换DTO为Entity
        Lead lead = new Lead();
        lead.setId(id);
        if (dto.getTitle() != null) lead.setTitle(dto.getTitle());
        if (dto.getDescription() != null) lead.setDescription(dto.getDescription());
        if (dto.getStatus() != null) lead.setStatus(dto.getStatus());
        if (dto.getPriority() != null) lead.setPriority(dto.getPriority());
        if (dto.getStage() != null) lead.setStage(dto.getStage());
        if (dto.getEstimatedValue() != null) lead.setEstimatedValue(dto.getEstimatedValue());
        if (dto.getSuccessProbability() != null) lead.setSuccessProbability(dto.getSuccessProbability());
        if (dto.getInterestedProducts() != null) lead.setInterestedProducts(dto.getInterestedProducts());
        if (dto.getBudgetRange() != null) lead.setBudgetRange(dto.getBudgetRange());
        if (dto.getDecisionTimeline() != null) lead.setDecisionTimeline(dto.getDecisionTimeline());
        if (dto.getCompetitorInfo() != null) lead.setCompetitorInfo(dto.getCompetitorInfo());
        if (dto.getAssignedTo() != null) lead.setAssignedTo(dto.getAssignedTo());
        if (dto.getFollowUpDate() != null && !dto.getFollowUpDate().isEmpty()) {
            lead.setFollowUpDate(LocalDate.parse(dto.getFollowUpDate()));
        }

        Long currentUserId = getCurrentUserId();
        Lead result = leadService.updateLead(lead, currentUserId);
        return ApiResponse.success(result, "更新成功");
    }

    /**
     * 删除线索
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "删除线索")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boolean result = leadService.deleteLead(id);
        if (result) {
            return ApiResponse.success(null, "删除成功");
        }
        return ApiResponse.error("删除失败", 500);
    }

    /**
     * 分配线索
     */
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "分配线索")
    public ApiResponse<Void> assign(@PathVariable Long id, @RequestParam Long assignTo) {
        leadService.assignLead(id, assignTo);
        return ApiResponse.success(null, "分配成功");
    }

    /**
     * 批量分配线索
     */
    @PostMapping("/batch-assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "批量分配线索")
    public ApiResponse<Void> batchAssign(
            @RequestParam List<Long> leadIds,
            @RequestParam Long assignTo) {
        leadService.assignLeadsBatch(leadIds, assignTo);
        return ApiResponse.success(null, "批量分配成功，共" + leadIds.size() + "条线索");
    }

    /**
     * 更新线索状态
     */
    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "更新线索状态")
    public ApiResponse<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        leadService.updateLeadStatus(id, status);
        return ApiResponse.success(null, "状态更新成功");
    }

    /**
     * 线索转客户
     */
    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "线索转客户")
    public ApiResponse<Customer> convertToCustomer(@PathVariable Long id, @RequestBody(required = false) Customer details) {
        Long currentUserId = getCurrentUserId();
        Customer result = leadService.convertToCustomer(id, currentUserId, details);
        return ApiResponse.success(result, "转客户成功");
    }

    /**
     * 获取线索统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "获取线索统计信息")
    public ApiResponse<Map<String, Object>> getStatistics() {
        Map<String, Object> result = leadService.getLeadStatistics();
        return ApiResponse.success(result, "获取成功");
    }

    /**
     * 获取逾期线索
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取逾期线索")
    public ApiResponse<List<Lead>> getOverdueLeads() {
        List<Lead> result = leadService.getOverdueLeads();
        return ApiResponse.success(result, "获取成功");
    }

    /**
     * 获取高价值线索
     */
    @GetMapping("/high-value")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取高价值线索")
    public ApiResponse<List<Lead>> getHighValueLeads(
            @RequestParam(defaultValue = "100000") BigDecimal threshold) {
        List<Lead> result = leadService.getHighValueLeads(threshold);
        return ApiResponse.success(result, "获取成功");
    }

    /**
     * 获取用户的线索
     */
    @GetMapping("/by-assignee/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "获取用户的线索")
    public ApiResponse<Page<Lead>> getLeadsByAssignee(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
    
        Page<Lead> result = leadService.getLeadsByAssignee(userId, normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "获取成功");
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                // 从认证对象获取用户ID，具体实现取决于SecurityConfig
                return 1L; // 示例值
            }
        } catch (Exception e) {
            log.debug("无法获取当前用户ID", e);
        }
        return 1L; // 默认值
    }
}

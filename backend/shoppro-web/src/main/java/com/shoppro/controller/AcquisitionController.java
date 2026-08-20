package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.ChannelCode;
import com.shoppro.entity.FissionTask;
import com.shoppro.entity.WelcomeMessage;
import com.shoppro.service.AcquisitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * <p>
 * Acquisition Controller
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@RestController
@RequestMapping("/acquisition")
@Tag(name = "获客管理", description = "渠道码、欢迎语、裂变任务")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class AcquisitionController {

    private final AcquisitionService acquisitionService;

    public AcquisitionController(AcquisitionService acquisitionService) {
        this.acquisitionService = acquisitionService;
    }

    // --- Channel Codes ---
    @GetMapping("/channels")
    @Operation(summary = "获取渠道码列表")
    public ApiResponse<List<ChannelCode>> listChannelCodes(@RequestParam(required = false) Long userId) {
        return ApiResponse.success(acquisitionService.listChannelCodes(resolveCurrentUserId(userId)));
    }

    @GetMapping("/channels/type")
    @Operation(summary = "根据类型获取渠道码")
    public ApiResponse<ChannelCode> getChannelByType(@RequestParam(required = false) Long userId, @RequestParam String type) {
        return ApiResponse.success(acquisitionService.getChannelCodeByType(resolveCurrentUserId(userId), type));
    }

    @PostMapping("/channels")
    @Operation(summary = "创建渠道码")
    public ApiResponse<ChannelCode> createChannelCode(@RequestBody ChannelCode channelCode) {
        channelCode.setUserId(resolveCurrentUserId(channelCode.getUserId()));
        channelCode.setEnterpriseId(currentEnterpriseId());
        return ApiResponse.success(acquisitionService.createChannelCode(channelCode));
    }

    @DeleteMapping("/channels/{id}")
    @Operation(summary = "删除渠道码")
    public ApiResponse<Void> deleteChannelCode(@PathVariable Long id) {
        acquisitionService.deleteChannelCode(id);
        return ApiResponse.success(null);
    }

    @PutMapping("/channels/{id}")
    @Operation(summary = "更新渠道码")
    public ApiResponse<ChannelCode> updateChannelCode(@PathVariable Long id, @RequestBody ChannelCode channelCode) {
        return ApiResponse.success(acquisitionService.updateChannelCode(id, channelCode));
    }

    // --- Welcome Messages ---
    @GetMapping("/welcome-message/list")
    @Operation(summary = "获取欢迎语列表")
    public ApiResponse<List<WelcomeMessage>> listWelcomeMessages(@RequestParam(required = false) Long tenantId) {
        Long targetId = resolveTenantId(tenantId);
        return ApiResponse.success(acquisitionService.listWelcomeMessages(targetId));
    }

    @GetMapping("/welcome/{channelCodeId}")
    @Operation(summary = "获取欢迎语")
    public ApiResponse<WelcomeMessage> getWelcomeMessage(@PathVariable Long channelCodeId) {
        return ApiResponse.success(acquisitionService.getWelcomeMessage(channelCodeId));
    }

    @PostMapping("/welcome")
    @Operation(summary = "保存/更新欢迎语")
    public ApiResponse<WelcomeMessage> saveWelcomeMessage(@RequestBody WelcomeMessage welcomeMessage) {
        welcomeMessage.setTenantId(currentEnterpriseId());
        return ApiResponse.success(acquisitionService.saveWelcomeMessage(welcomeMessage));
    }

    @DeleteMapping("/welcome/{id}")
    @Operation(summary = "删除欢迎语")
    public ApiResponse<Void> deleteWelcomeMessage(@PathVariable Long id) {
        acquisitionService.deleteWelcomeMessage(id);
        return ApiResponse.success(null);
    }

    // --- Fission Tasks ---
    @GetMapping("/fission")
    @Operation(summary = "获取裂变任务列表")
    public ApiResponse<List<FissionTask>> listFissionTasks() {
        return ApiResponse.success(acquisitionService.listFissionTasks());
    }

    @PostMapping("/fission")
    @Operation(summary = "创建裂变任务")
    public ApiResponse<FissionTask> createFissionTask(@RequestBody FissionTask task) {
        return ApiResponse.success(acquisitionService.createFissionTask(task));
    }

    @PutMapping("/fission/{id}/status")
    @Operation(summary = "切换裂变任务状态")
    public ApiResponse<Void> toggleFissionTaskStatus(@PathVariable Long id) {
        acquisitionService.toggleFissionTaskStatus(id);
        return ApiResponse.success(null);
    }

    // --- Statistics ---
    @GetMapping("/stats/global")
    @Operation(summary = "获取全局获客统计（总计）")
    public ApiResponse<java.util.Map<String, Object>> getGlobalStats(@RequestParam(required = false) Long tenantId) {
        Long targetId = resolveTenantId(tenantId);
        return ApiResponse.success(acquisitionService.getGlobalAcquisitionStats(targetId));
    }

    @GetMapping("/stats/channels")
    @Operation(summary = "获取渠道分布统计")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> getChannelDistribution(
            @RequestParam(required = false) Long tenantId) {
        Long targetId = resolveTenantId(tenantId);
        return ApiResponse.success(acquisitionService.getChannelDistribution(targetId));
    }

    @GetMapping("/stats/sales")
    @Operation(summary = "获取销售引流排行")
    public ApiResponse<java.util.List<java.util.Map<String, Object>>> getSalesRanking(
            @RequestParam(required = false) Long tenantId) {
        Long targetId = tenantId != null ? tenantId
                : com.shoppro.util.SecurityUtils.getLoginUser().getUser().getEnterpriseId();
        return ApiResponse.success(acquisitionService.getSalesRanking(targetId));
    }

    @GetMapping("/channels/export")
    @Operation(summary = "导出渠道码数据报表")
    public org.springframework.http.ResponseEntity<String> exportChannelStats() {
        String csv = acquisitionService.exportChannelStats();
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=channel_stats.csv")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    private Long currentEnterpriseId() {
        return com.shoppro.util.SecurityUtils.getLoginUser().getUser().getEnterpriseId();
    }

    private Long resolveCurrentUserId(Long requestedUserId) {
        boolean platform = com.shoppro.util.SecurityUtils.getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> java.util.Set.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_PLATFORM_ADMIN").contains(authority.getAuthority()));
        return platform && requestedUserId != null ? requestedUserId : com.shoppro.util.SecurityUtils.getUserId();
    }

    private Long resolveTenantId(Long requestedTenantId) {
        boolean platform = com.shoppro.util.SecurityUtils.getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> java.util.Set.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_PLATFORM_ADMIN").contains(authority.getAuthority()));
        return platform && requestedTenantId != null ? requestedTenantId : currentEnterpriseId();
    }

    @GetMapping("/channels/{id}/stats")
    @Operation(summary = "获取渠道码统计数据")
    public ApiResponse<List<com.shoppro.entity.ChannelCodeStat>> getChannelStats(
            @PathVariable Long id,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        return ApiResponse.success(acquisitionService.getChannelStats(id, startDate, endDate));
    }

    @PostMapping("/channels/{id}/scan")
    @Operation(summary = "触发渠道码扫码记录")
    public ApiResponse<Void> recordScan(@PathVariable Long id) {
        acquisitionService.recordScan(id);
        return ApiResponse.success(null);
    }
}

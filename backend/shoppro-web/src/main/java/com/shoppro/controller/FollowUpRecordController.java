package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.request.FollowUpCreateDTO;
import com.shoppro.dto.request.FollowUpUpdateDTO;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.dto.response.FollowUpResponseVO;
import com.shoppro.entity.FollowUpRecord;
import com.shoppro.service.FollowUpRecordService;
import com.shoppro.repository.UserRepository;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 跟进记录管理控制器
 * 提供跟进记录的CRUD、查询、提醒、统计等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/follow-ups")
@Tag(name = "跟进记录管理", description = "跟进记录的增删改查、提醒、统计等操作")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
public class FollowUpRecordController {

    private static final Logger log = LoggerFactory.getLogger(FollowUpRecordController.class);

    private final FollowUpRecordService followUpRecordService;
    private final UserRepository userRepository;

    public FollowUpRecordController(FollowUpRecordService followUpRecordService, UserRepository userRepository) {
        this.followUpRecordService = followUpRecordService;
        this.userRepository = userRepository;
    }

    /**
     * 分页查询跟进记录列表
     */
    @GetMapping("/list")
    @Operation(summary = "分页查询跟进记录列表")
    public ApiResponse<Page<FollowUpResponseVO>> list(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long leadId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        try {
            Map<String, Object> filters = new HashMap<>();
            if (leadId != null) filters.put("leadId", leadId);
            if (customerId != null) filters.put("customerId", customerId);
            if (userId != null) filters.put("userId", userId);
            if (type != null) filters.put("type", type);
            if (result != null) filters.put("result", result);
            if (startDate != null) filters.put("startDate", startDate);
            if (endDate != null) filters.put("endDate", endDate);

            // 归一化分页参数，避免非法或过大值
            int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
            int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);

            Page<FollowUpRecord> page = followUpRecordService.listFollowUps(normalizedPageNo, normalizedPageSize, filters);
            Page<FollowUpResponseVO> voPage = convertToVOPage(page);

            return ApiResponse.success(voPage, "查询成功");
        } catch (Exception e) {
            log.error("查询跟进记录列表失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取跟进记录详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取跟进记录详情")
    public ApiResponse<FollowUpResponseVO> getDetail(@PathVariable Long id) {
        try {
            FollowUpRecord followUp = followUpRecordService.getFollowUpDetail(id);
            FollowUpResponseVO vo = convertToVO(followUp);
            return ApiResponse.success(vo, "获取成功");
        } catch (Exception e) {
            log.error("获取跟进记录详情失败: {}", id, e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 创建跟进记录
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "创建跟进记录")
    public ApiResponse<FollowUpResponseVO> create(@Valid @RequestBody FollowUpCreateDTO dto) {
        try {
            Long userId = getCurrentUserId();

            FollowUpRecord followUp = new FollowUpRecord();
            followUp.setLeadId(dto.getLeadId());
            followUp.setCustomerId(dto.getCustomerId());
            followUp.setTitle(dto.getTitle());
            followUp.setContent(dto.getContent());
            followUp.setType(dto.getType());
            followUp.setResult(dto.getResult());
            followUp.setNextFollowUpDate(dto.getNextFollowUpDate());
            followUp.setDuration(dto.getDuration());
            followUp.setAttachments(dto.getAttachments());

            FollowUpRecord created = followUpRecordService.createFollowUp(followUp, userId);
            FollowUpResponseVO vo = convertToVO(created);

            log.info("跟进记录创建成功: id={}, createdBy={}", created.getId(), userId);
            return ApiResponse.success(vo, "创建成功");
        } catch (Exception e) {
            log.error("创建跟进记录失败", e);
            return ApiResponse.error("创建失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 更新跟进记录
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    @Operation(summary = "更新跟进记录")
    public ApiResponse<FollowUpResponseVO> update(
            @PathVariable Long id,
            @Valid @RequestBody FollowUpUpdateDTO dto) {
        try {
            FollowUpRecord followUp = new FollowUpRecord();
            followUp.setId(id);
            followUp.setTitle(dto.getTitle());
            followUp.setContent(dto.getContent());
            followUp.setResult(dto.getResult());
            followUp.setNextFollowUpDate(dto.getNextFollowUpDate());
            followUp.setDuration(dto.getDuration());
            followUp.setAttachments(dto.getAttachments());

            FollowUpRecord updated = followUpRecordService.updateFollowUp(followUp);
            FollowUpResponseVO vo = convertToVO(updated);

            log.info("跟进记录更新成功: id={}", id);
            return ApiResponse.success(vo, "更新成功");
        } catch (Exception e) {
            log.error("更新跟进记录失败: {}", id, e);
            return ApiResponse.error("更新失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 删除跟进记录
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "删除跟进记录")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        try {
            boolean result = followUpRecordService.deleteFollowUp(id);
            if (result) {
                log.info("跟进记录删除成功: id={}", id);
                return ApiResponse.success(null, "删除成功");
            } else {
                return ApiResponse.error("删除失败", 500);
            }
        } catch (Exception e) {
            log.error("删除跟进记录失败: {}", id, e);
            return ApiResponse.error("删除失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取待提醒的跟进记录
     */
    @GetMapping("/reminders/pending")
    @Operation(summary = "获取待提醒的跟进记录（一小时内）")
    public ApiResponse<List<FollowUpResponseVO>> getPendingReminders() {
        try {
            List<FollowUpRecord> reminders = followUpRecordService.getPendingReminders();
            List<FollowUpResponseVO> voList = reminders.stream()
                    .map(this::convertToVO)
                    .collect(Collectors.toList());
            return ApiResponse.success(voList, "查询成功");
        } catch (Exception e) {
            log.error("获取待提醒记录失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取逾期的跟进记录
     */
    @GetMapping("/overdue")
    @Operation(summary = "获取逾期未跟进的记录")
    public ApiResponse<List<FollowUpResponseVO>> getOverdueFollowUps() {
        try {
            List<FollowUpRecord> overdue = followUpRecordService.getOverdueFollowUps();
            List<FollowUpResponseVO> voList = overdue.stream()
                    .map(this::convertToVO)
                    .collect(Collectors.toList());
            return ApiResponse.success(voList, "查询成功");
        } catch (Exception e) {
            log.error("获取逾期记录失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取今天的跟进记录
     */
    @GetMapping("/today")
    @Operation(summary = "获取今天的跟进记录")
    public ApiResponse<List<FollowUpResponseVO>> getTodayFollowUps() {
        try {
            List<FollowUpRecord> todayList = followUpRecordService.getTodayFollowUps();
            List<FollowUpResponseVO> voList = todayList.stream()
                    .map(this::convertToVO)
                    .collect(Collectors.toList());
            return ApiResponse.success(voList, "查询成功");
        } catch (Exception e) {
            log.error("获取今天记录失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取待跟进的记录
     */
    @GetMapping("/pending")
    @Operation(summary = "获取待跟进的记录（下次跟进时间≤今天）")
    public ApiResponse<List<FollowUpResponseVO>> getPendingFollowUps() {
        try {
            List<FollowUpRecord> pending = followUpRecordService.getPendingFollowUps();
            List<FollowUpResponseVO> voList = pending.stream()
                    .map(this::convertToVO)
                    .collect(Collectors.toList());
            return ApiResponse.success(voList, "查询成功");
        } catch (Exception e) {
            log.error("获取待跟进记录失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取用户的跟进记录列表
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "获取指定用户的跟进记录")
    public ApiResponse<Page<FollowUpResponseVO>> getFollowUpsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        try {
            // 归一化分页参数，避免非法或过大值
            int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
            int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);

            Page<FollowUpRecord> page = followUpRecordService.getFollowUpsByUser(userId, normalizedPageNo, normalizedPageSize);
            Page<FollowUpResponseVO> voPage = convertToVOPage(page);
            return ApiResponse.success(voPage, "查询成功");
        } catch (Exception e) {
            log.error("获取用户跟进记录失败: {}", userId, e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取线索的所有跟进记录
     */
    @GetMapping("/lead/{leadId}")
    @Operation(summary = "获取指定线索的所有跟进记录")
    public ApiResponse<List<FollowUpResponseVO>> getFollowUpsByLead(@PathVariable Long leadId) {
        try {
            List<FollowUpRecord> records = followUpRecordService.getFollowUpsByLead(leadId);
            List<FollowUpResponseVO> voList = records.stream()
                    .map(this::convertToVO)
                    .collect(Collectors.toList());
            return ApiResponse.success(voList, "查询成功");
        } catch (Exception e) {
            log.error("获取线索跟进记录失败: {}", leadId, e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取客户的所有跟进记录
     */
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "获取指定客户的所有跟进记录")
    public ApiResponse<List<FollowUpResponseVO>> getFollowUpsByCustomer(@PathVariable Long customerId) {
        try {
            List<FollowUpRecord> records = followUpRecordService.getFollowUpsByCustomer(customerId);
            List<FollowUpResponseVO> voList = records.stream()
                    .map(this::convertToVO)
                    .collect(Collectors.toList());
            return ApiResponse.success(voList, "查询成功");
        } catch (Exception e) {
            log.error("获取客户跟进记录失败: {}", customerId, e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取跟进记录统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取全局跟进统计信息")
    public ApiResponse<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = followUpRecordService.getFollowUpStatistics();
            return ApiResponse.success(stats, "查询成功");
        } catch (Exception e) {
            log.error("获取统计信息失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取用户的跟进统计
     */
    @GetMapping("/statistics/user/{userId}")
    @Operation(summary = "获取指定用户的跟进统计")
    public ApiResponse<Map<String, Object>> getUserStatistics(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = followUpRecordService.getUserFollowUpStatistics(userId);
            return ApiResponse.success(stats, "查询成功");
        } catch (Exception e) {
            log.error("获取用户统计失败: {}", userId, e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取按方式统计的跟进次数
     */
    @GetMapping("/statistics/by-type")
    @Operation(summary = "获取按方式统计的跟进次数")
    public ApiResponse<Map<String, Long>> countFollowUpsByType() {
        try {
            Map<String, Long> counts = followUpRecordService.countFollowUpsByType();
            return ApiResponse.success(counts, "查询成功");
        } catch (Exception e) {
            log.error("获取按类型统计失败", e);
            return ApiResponse.error("查询失败: " + e.getMessage(), 500);
        }
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                com.shoppro.entity.User user = userRepository.selectByUsername(auth.getName());
                if (user != null) return user.getId();
            }
        } catch (Exception e) {
            log.debug("无法获取当前用户ID", e);
        }
        throw new IllegalStateException("无法识别当前用户");
    }

    /**
     * 将FollowUpRecord转换为VO
     */
    private FollowUpResponseVO convertToVO(FollowUpRecord record) {
        if (record == null) return null;

        FollowUpResponseVO vo = new FollowUpResponseVO();
        vo.setId(record.getId());
        vo.setLeadId(record.getLeadId());
        vo.setCustomerId(record.getCustomerId());
        vo.setUserId(record.getUserId());
        vo.setTitle(record.getTitle());
        vo.setContent(record.getContent());
        vo.setType(record.getType());
        vo.setResult(record.getResult());
        vo.setNextFollowUpDate(record.getNextFollowUpDate());
        vo.setDuration(record.getDuration());
        vo.setAttachments(record.getAttachments());
        vo.setCreatedAt(record.getCreatedAt());

        return vo;
    }

    /**
     * 将Page<FollowUpRecord>转换为Page<FollowUpResponseVO>
     */
    private Page<FollowUpResponseVO> convertToVOPage(Page<FollowUpRecord> page) {
        Page<FollowUpResponseVO> voPage = new Page<>(page.getCurrent(), page.getSize());
        voPage.setTotal(page.getTotal());
        voPage.setRecords(page.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }
}

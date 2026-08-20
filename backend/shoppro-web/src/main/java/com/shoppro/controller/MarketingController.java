package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.MarketingTask;
import com.shoppro.service.MarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * 营销自动化控制器
 */
@Tag(name = "Marketing Automation", description = "营销任务创建、调度及发送记录接口")
@RestController
@RequestMapping("/marketing")
@Tag(name = "营销管理")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES')")
public class MarketingController {

    private final MarketingService marketingService;

    public MarketingController(MarketingService marketingService) {
        this.marketingService = marketingService;
    }

    @Operation(summary = "创建营销任务")
    @PostMapping("/tasks")
    public ApiResponse<MarketingTask> createTask(@RequestBody MarketingTask task) {
        return ApiResponse.success(marketingService.createTask(task));
    }

    @Operation(summary = "启动任务调度")
    @PostMapping("/tasks/{id}/start")
    public ApiResponse<Void> startTask(@PathVariable Long id) {
        marketingService.startTask(id);
        return ApiResponse.success(null, "任务已启动");
    }

    @Operation(summary = "停止任务调度")
    @PostMapping("/tasks/{id}/stop")
    public ApiResponse<Void> stopTask(@PathVariable Long id) {
        marketingService.stopTask(id);
        return ApiResponse.success(null, "任务已停止");
    }

    @Operation(summary = "分页查询营销任务列表")
    @GetMapping("/tasks")
    public ApiResponse<Page<MarketingTask>> pageTasks(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name) {
        return ApiResponse.success(marketingService.pageTasks(pageNo, pageSize, name));
    }

    @Operation(summary = "获取任务执行记录摘要")
    @GetMapping("/tasks/{id}/summary")
    public ApiResponse<MarketingTask> getTaskSummary(@PathVariable Long id) {
        return ApiResponse.success(marketingService.getTaskSummary(id));
    }
}

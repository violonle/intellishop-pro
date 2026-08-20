package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.OperationLog;
import com.shoppro.service.OperationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Operation Logs", description = "操作日志审计")
@RestController
@RequestMapping("/logs")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
public class LogController {

    private final OperationLogService operationLogService;

    public LogController(OperationLogService operationLogService) {
        this.operationLogService = operationLogService;
    }

    @Operation(summary = "分页获取操作日志")
    @GetMapping("/page")
    public ApiResponse<Page<OperationLog>> getLogPage(
            @RequestParam(value = "pageNo", defaultValue = "1") int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "15") int pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String module) {
        return ApiResponse.success(operationLogService.getLogPage(pageNo, pageSize, username, module));
    }
}

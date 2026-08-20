package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.Customer;
import com.shoppro.service.CustomerService;
import com.shoppro.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 客户管理控制器
 * 提供客户的CRUD、搜索、分配、统计等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/customers")
@Tag(name = "客户管理", description = "客户信息的增删改查、搜索、分配等功能")
public class CustomerController {

    private static final Logger log = LoggerFactory.getLogger(CustomerController.class);

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /**
     * 分页查询客户列表
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "分页查询客户列表")

    public ApiResponse<Page<Customer>> list(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level) {
        // 归一化分页参数，避免过大/非法值
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Customer> result = customerService.listCustomers(normalizedPageNo, normalizedPageSize, status, level);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 搜索客户
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "搜索客户")

    public ApiResponse<Page<Customer>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        // 归一化分页参数，避免过大/非法值
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Customer> result = customerService.searchCustomers(keyword, normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "搜索成功");
    }

    /**
     * 获取客户详情
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "获取客户详情")
    public ApiResponse<Customer> detail(@PathVariable Long id) {
        Customer customer = customerService.getCustomerDetail(id);
        if (customer == null) {
            return ApiResponse.error("客户不存在", 404);
        }
        return ApiResponse.success(customer, "获取成功");
    }

    /**
     * 创建客户
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('SALES')")
    @Operation(summary = "创建客户")
    public ApiResponse<Customer> create(@RequestBody Customer customer) {
        boolean result = customerService.createCustomer(customer);
        if (result) {
            return ApiResponse.success(customer, "创建成功");
        }
        return ApiResponse.error("创建失败", 500);
    }

    /**
     * 更新客户
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('SALES')")
    @Operation(summary = "更新客户")
    public ApiResponse<Customer> update(@PathVariable Long id, @RequestBody Customer customer) {
        customer.setId(id);
        boolean result = customerService.updateCustomer(customer);
        if (result) {
            return ApiResponse.success(customer, "更新成功");
        }
        return ApiResponse.error("更新失败", 500);
    }

    /**
     * 删除客户
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "删除客户")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boolean result = customerService.deleteCustomer(id);
        if (result) {
            return ApiResponse.success(null, "删除成功");
        }
        return ApiResponse.error("删除失败", 500);
    }

    /**
     * 分配客户
     */
    @PostMapping("/{customerId}/assign")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "分配客户")

    public ApiResponse<Void> assign(@PathVariable Long customerId, @RequestParam Long userId) {
        boolean result = customerService.assignCustomer(customerId, userId);
        if (result) {
            return ApiResponse.success(null, "分配成功");
        }
        return ApiResponse.error("分配失败", 500);
    }

    /**
     * 批量分配客户
     */
    @PostMapping("/assign-batch")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "批量分配客户")
    public ApiResponse<Void> assignBatch(@RequestBody List<Long> customerIds, @RequestParam Long userId) {
        boolean result = customerService.assignCustomersBatch(customerIds, userId);
        if (result) {
            return ApiResponse.success(null, "批量分配成功");
        }
        return ApiResponse.error("批量分配失败", 500);
    }

    /**
     * 获取VIP客户列表
     */
    @GetMapping("/vip")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "获取VIP客户列表")

    public ApiResponse<Page<Customer>> getVIPCustomers(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        // 归一化分页参数，避免过大/非法值
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
    
        Page<Customer> result = customerService.getVIPCustomers(normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 获取活跃客户列表
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "获取活跃客户列表")

    public ApiResponse<Page<Customer>> getActiveCustomers(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
    
        // 归一化分页参数，避免过大/非法值
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
    
        Page<Customer> result = customerService.getActiveCustomers(normalizedPageNo, normalizedPageSize);
        return ApiResponse.success(result, "查询成功");
    }

    /**
     * 获取客户统计信息
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "获取客户统计信息")
    public ApiResponse<Map<String, Object>> statistics() {
        Map<String, Object> stats = customerService.getCustomerStatistics();
        return ApiResponse.success(stats, "获取成功");
    }

    /**
     * 获取客户360视图
     */
    @GetMapping("/{id}/360view")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES', 'USER')")
    @Operation(summary = "获取客户360视图")
    public ApiResponse<Map<String, Object>> get360View(@PathVariable Long id) {
        Map<String, Object> view = customerService.getCustomer360View(id);
        return ApiResponse.success(view, "获取成功");
    }

    /**
     * 升级客户等级
     */
    @PostMapping("/{customerId}/upgrade-level")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "升级客户等级")
    public ApiResponse<Void> upgradeLevel(@PathVariable Long customerId, @RequestParam String newLevel) {
        boolean result = customerService.upgradeCustomerLevel(customerId, newLevel);
        if (result) {
            return ApiResponse.success(null, "升级成功");
        }
        return ApiResponse.error("升级失败", 500);
    }

    /**
     * 标记客户为流失
     */
    @PostMapping("/{customerId}/mark-lost")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "标记客户为流失")
    public ApiResponse<Void> markAsLost(@PathVariable Long customerId, @RequestParam String reason) {
        boolean result = customerService.markAsLostCustomer(customerId, reason);
        if (result) {
            return ApiResponse.success(null, "标记成功");
        }
        return ApiResponse.error("标记失败", 500);
    }

    /**
     * 恢复流失客户
     */
    @PostMapping("/{customerId}/recover")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "恢复流失客户")
    public ApiResponse<Void> recoverLost(@PathVariable Long customerId) {
        boolean result = customerService.recoverLostCustomer(customerId);
        if (result) {
            return ApiResponse.success(null, "恢复成功");
        }
        return ApiResponse.error("恢复失败", 500);
    }
}

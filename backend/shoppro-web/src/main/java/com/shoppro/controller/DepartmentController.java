package com.shoppro.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.dto.response.RankConfig;
import com.shoppro.entity.Department;
import com.shoppro.service.DepartmentService;
import com.shoppro.util.PaginationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.shoppro.service.SystemSettingService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

/**
 * 部门管理控制器
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/departments")
@Tag(name = "部门管理", description = "部门的增删改查、树形结构等功能")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER', 'SALES', 'USER')")
public class DepartmentController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DepartmentController.class);

    private final DepartmentService departmentService;
    private final SystemSettingService systemSettingService;
    private final ObjectMapper objectMapper;

    public DepartmentController(DepartmentService departmentService, SystemSettingService systemSettingService,
                                ObjectMapper objectMapper) {
        this.departmentService = departmentService;
        this.systemSettingService = systemSettingService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    @Operation(summary = "创建部门")
    public ApiResponse<Department> createDepartment(@RequestBody Department department) {
        log.info("创建部门: {}", department.getName());
        Department result = departmentService.createDepartment(department);
        return ApiResponse.success(result, "部门创建成功");
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    @Operation(summary = "编辑部门")
    public ApiResponse<Department> updateDepartment(@PathVariable Long id, @RequestBody Department department) {
        log.info("编辑部门: {}", id);
        department.setId(id);
        Department result = departmentService.updateDepartment(department);
        return ApiResponse.success(result, "部门编辑成功");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除部门")
    public ApiResponse<Void> deleteDepartment(@PathVariable Long id) {
        log.info("删除部门: {}", id);
        departmentService.deleteDepartment(id);
        return ApiResponse.success(null, "部门删除成功");
    }

    @PostMapping("/{id}/soft-delete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "软删除部门")
    public ApiResponse<Void> softDeleteDepartment(@PathVariable Long id) {
        log.info("软删除部门: {}", id);
        departmentService.softDeleteDepartment(id);
        return ApiResponse.success(null, "部门已禁用");
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "恢复部门")
    public ApiResponse<Void> restoreDepartment(@PathVariable Long id) {
        log.info("恢复部门: {}", id);
        departmentService.restoreDepartment(id);
        return ApiResponse.success(null, "部门已恢复");
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "获取部门详情")
    public ApiResponse<Department> getById(@PathVariable Long id) {
        log.info("获取部门详情: {}", id);
        Department department = departmentService.getById(id);
        return ApiResponse.success(department, "获取成功");
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "分页查询部门列表")
    public ApiResponse<Page<Department>> pageDepartments(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        log.info("分页查询部门: pageNo={}, pageSize={}", pageNo, pageSize);

        // 归一化分页参数
        int normalizedPageNo = PaginationUtils.normalizePageNo(pageNo);
        int normalizedPageSize = PaginationUtils.normalizePageSize(pageSize);
        Page<Department> page = departmentService.pageDepartments(normalizedPageNo, normalizedPageSize, name, status);
        return ApiResponse.success(page, "查询成功");
    }

    @GetMapping("/enabled")
    @Operation(summary = "获取所有启用部门")
    public ApiResponse<List<Department>> getAllEnabledDepartments() {
        log.info("获取所有启用部门");
        List<Department> departments = departmentService.getAllEnabledDepartments();
        return ApiResponse.success(departments, "获取成功");
    }

    @GetMapping("/tree")
    @Operation(summary = "获取部门树（完整层级结构）")
    public ApiResponse<List<Department>> getDepartmentTree(
            @RequestParam(defaultValue = "0") Long parentId) {
        log.info("获取部门树: parentId={}", parentId);
        List<Department> tree = departmentService.getDepartmentTree(parentId);
        return ApiResponse.success(tree, "获取成功");
    }

    @GetMapping("/root")
    @Operation(summary = "获取顶级部门列表")
    public ApiResponse<List<Department>> getRootDepartments() {
        log.info("获取顶级部门");
        List<Department> departments = departmentService.getRootDepartments();
        return ApiResponse.success(departments, "获取成功");
    }

    @GetMapping("/{parentId}/children")
    @Operation(summary = "获取子部门列表")
    public ApiResponse<List<Department>> getChildDepartments(@PathVariable Long parentId) {
        log.info("获取子部门: parentId={}", parentId);
        List<Department> departments = departmentService.getChildDepartments(parentId);
        return ApiResponse.success(departments, "获取成功");
    }

    @GetMapping("/{id}/path")
    @Operation(summary = "获取部门的完整层级路径")
    public ApiResponse<List<Department>> getDepartmentPath(@PathVariable Long id) {
        log.info("获取部门路径: id={}", id);
        List<Department> path = departmentService.getDepartmentPath(id);
        return ApiResponse.success(path, "获取成功");
    }

    @GetMapping("/{id}/full-path")
    @Operation(summary = "获取部门的完整名称路径")
    public ApiResponse<String> getDepartmentFullPath(@PathVariable Long id) {
        log.info("获取部门全路径: id={}", id);
        String fullPath = departmentService.getDepartmentFullPath(id);
        return ApiResponse.success(fullPath, "获取成功");
    }

    @GetMapping("/{id}/sub-departments")
    @Operation(summary = "获取部门的所有子部门（包括嵌套的）")
    public ApiResponse<List<Department>> getAllSubDepartments(@PathVariable Long id) {
        log.info("获取所有子部门: id={}", id);
        List<Department> departments = departmentService.getAllSubDepartments(id);
        return ApiResponse.success(departments, "获取成功");
    }

    @GetMapping("/ranks")
    @Operation(summary = "获取职级体系配置")
    public ApiResponse<List<RankConfig>> getRankConfig() {
        try {
            String value = systemSettingService.getSettingValue("role.rank.config");
            List<RankConfig> config = objectMapper.readValue(value == null ? "[]" : value,
                    new TypeReference<List<RankConfig>>() {});
            return ApiResponse.success(config, "获取成功");
        } catch (Exception e) {
            log.error("读取职级配置失败", e);
            return ApiResponse.error(500, "读取职级配置失败");
        }
    }

    @PostMapping("/ranks")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')")
    @Operation(summary = "更新职级体系配置")
    public ApiResponse<Void> updateRankConfig(@RequestBody List<RankConfig> config) {
        if (config == null || config.isEmpty() || config.stream().anyMatch(item -> item.getLevels() == null || item.getLevels().isEmpty())) {
            return ApiResponse.error(400, "职级配置不能为空");
        }
        try {
            systemSettingService.saveSetting("role.rank.config", objectMapper.writeValueAsString(config), "职级体系配置");
            return ApiResponse.success(null, "职级体系配置更新成功");
        } catch (Exception e) {
            log.error("更新职级配置失败", e);
            return ApiResponse.error(500, "更新职级配置失败");
        }
    }
}

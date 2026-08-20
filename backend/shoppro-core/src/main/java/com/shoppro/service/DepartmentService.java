package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Department;

import java.util.List;

/**
 * 部门服务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface DepartmentService {

    /**
     * 创建部门
     */
    Department createDepartment(Department department);

    /**
     * 编辑部门
     */
    Department updateDepartment(Department department);

    /**
     * 删除部门（需要检查是否有子部门和用户）
     */
    boolean deleteDepartment(Long departmentId);

    /**
     * 软删除部门
     */
    boolean softDeleteDepartment(Long departmentId);

    /**
     * 恢复软删除的部门
     */
    boolean restoreDepartment(Long departmentId);

    /**
     * 批量软删除部门
     */
    boolean softDeleteBatch(List<Long> departmentIds);

    /**
     * 获取部门详情
     */
    Department getById(Long departmentId);

    /**
     * 按部门名称查询
     */
    Department getByName(String name);

    /**
     * 分页查询部门列表
     */
    Page<Department> pageDepartments(int pageNo, int pageSize, String name, Integer status);

    /**
     * 获取所有启用部门
     */
    List<Department> getAllEnabledDepartments();

    /**
     * 获取顶级部门列表
     */
    List<Department> getRootDepartments();

    /**
     * 获取子部门列表
     */
    List<Department> getChildDepartments(Long parentId);

    /**
     * 获取部门树（完整的层级结构）
     */
    List<Department> getDepartmentTree(Long parentId);

    /**
     * 获取部门的完整层级路径
     */
    List<Department> getDepartmentPath(Long departmentId);

    /**
     * 获取部门的所有子部门（包括嵌套的）
     */
    List<Department> getAllSubDepartments(Long departmentId);

    /**
     * 检查部门名称是否存在
     */
    boolean existsByName(String name, Long excludeId);

    /**
     * 统计启用部门数
     */
    int countEnabledDepartments();

    /**
     * 获取部门下的用户数
     */
    int countUsersByDepartment(Long departmentId);

    /**
     * 统计子部门数
     */
    int countChildDepartments(Long parentId);

    /**
     * 移动部门到另一个父部门
     */
    void moveDepartment(Long departmentId, Long newParentId);

    /**
     * 修改部门排序
     */
    void updateDepartmentOrder(Long departmentId, int newOrder);

    /**
     * 检查部门是否是另一个部门的子部门
     */
    boolean isSubDepartmentOf(Long departmentId, Long parentId);

    /**
     * 获取部门管理者管理的所有部门
     */
    List<Department> getManagedDepartments(Long managerId);

    /**
     * 启用部门
     */
    void enableDepartment(Long departmentId);

    /**
     * 禁用部门
     */
    void disableDepartment(Long departmentId);

    /**
     * 检查部门是否可以删除
     */
    boolean canDeleteDepartment(Long departmentId);

    /**
     * 获取部门的完整名称路径（如：总公司 > 销售部 > 华东分部）
     */
    String getDepartmentFullPath(Long departmentId);
}

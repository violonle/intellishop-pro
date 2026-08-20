package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Permission;

import java.util.List;

/**
 * 权限服务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface PermissionService {

    /**
     * 创建权限
     */
    Permission createPermission(Permission permission);

    /**
     * 编辑权限
     */
    Permission updatePermission(Permission permission);

    /**
     * 删除权限
     */
    boolean deletePermission(Long permissionId);

    /**
     * 软删除权限
     */
    boolean softDeletePermission(Long permissionId);

    /**
     * 恢复软删除的权限
     */
    boolean restorePermission(Long permissionId);

    /**
     * 批量删除权限
     */
    boolean deleteBatch(List<Long> permissionIds);

    /**
     * 获取权限详情
     */
    Permission getById(Long permissionId);

    /**
     * 按权限代码查询
     */
    Permission getByCode(String code);

    /**
     * 按权限名称查询
     */
    Permission getByName(String name);

    /**
     * 分页查询权限列表
     */
    Page<Permission> pagePermissions(int pageNo, int pageSize, String name, String resource, Integer status);

    /**
     * 获取所有启用权限
     */
    List<Permission> getAllEnabledPermissions();

    /**
     * 获取某个资源的所有权限
     */
    List<Permission> getPermissionsByResource(String resource);

    /**
     * 获取用户的所有权限
     */
    List<Permission> getUserPermissions(Long userId);

    /**
     * 获取用户在某个资源上的权限
     */
    List<Permission> getUserResourcePermissions(Long userId, String resource);

    /**
     * 获取角色的所有权限
     */
    List<Permission> getRolePermissions(Long roleId);

    /**
     * 检查用户是否拥有某个权限
     */
    boolean hasPermission(Long userId, String permissionCode);

    /**
     * 检查用户是否拥有某个资源的操作权限
     */
    boolean hasResourcePermission(Long userId, String resource, String action);

    /**
     * 批量检查权限
     */
    List<Boolean> hasPermissions(Long userId, List<String> permissionCodes);

    /**
     * 检查权限代码是否存在
     */
    boolean existsByCode(String code, Long excludeId);

    /**
     * 统计启用权限数
     */
    int countEnabledPermissions();

    /**
     * 按资源和操作查询权限
     */
    Permission getByResourceAndAction(String resource, String action);

    /**
     * 统计某个资源的权限数
     */
    int countPermissionsByResource(String resource);

    /**
     * 获取所有资源列表
     */
    List<String> getAllResources();

    /**
     * 启用权限
     */
    void enablePermission(Long permissionId);

    /**
     * 禁用权限
     */
    void disablePermission(Long permissionId);

    /**
     * 修改权限排序
     */
    void updatePermissionOrder(Long permissionId, int newOrder);

    /**
     * 检查权限是否被使用
     */
    boolean isPermissionInUse(Long permissionId);

    /**
     * 批量查询权限
     */
    List<Permission> getPermissions(List<Long> permissionIds);
}

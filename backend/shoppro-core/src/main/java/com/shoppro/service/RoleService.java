package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Role;
import com.shoppro.entity.RolePermission;

import java.util.List;

/**
 * 角色服务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface RoleService {

    /**
     * 创建角色
     */
    Role createRole(Role role);

    /**
     * 编辑角色
     */
    Role updateRole(Role role);

    /**
     * 删除角色
     */
    boolean deleteRole(Long roleId);

    /**
     * 软删除角色
     */
    boolean softDeleteRole(Long roleId);

    /**
     * 恢复软删除的角色
     */
    boolean restoreRole(Long roleId);

    /**
     * 批量删除角色
     */
    boolean deleteBatch(List<Long> roleIds);

    /**
     * 获取角色详情
     */
    Role getById(Long roleId);

    /**
     * 按角色名称查询
     */
    Role getByName(String name);

    /**
     * 按角色代码查询
     */
    Role getByCode(String code);

    /**
     * 分页查询角色列表
     */
    Page<Role> pageRoles(int pageNo, int pageSize, String name, Integer status);

    /**
     * 获取所有启用角色
     */
    List<Role> getAllEnabledRoles();

    /**
     * 获取用户的所有角色
     */
    List<Role> getUserRoles(Long userId);

    /**
     * 为用户分配角色
     */
    void assignRolesToUser(Long userId, List<Long> roleIds);

    /**
     * 移除用户的角色
     */
    void removeRolesFromUser(Long userId, List<Long> roleIds);

    /**
     * 获取角色的权限
     */
    List<RolePermission> getRolePermissions(Long roleId);

    /**
     * 为角色分配权限
     */
    void assignPermissionsToRole(Long roleId, List<Long> permissionIds);

    /**
     * 移除角色的权限
     */
    void removePermissionsFromRole(Long roleId, List<Long> permissionIds);

    /**
     * 清空角色的所有权限
     */
    void clearRolePermissions(Long roleId);

    /**
     * 检查角色名称是否存在
     */
    boolean existsByName(String name, Long excludeId);

    /**
     * 检查角色代码是否存在
     */
    boolean existsByCode(String code, Long excludeId);

    /**
     * 统计启用角色数
     */
    int countEnabledRoles();

    /**
     * 获取角色下的用户数
     */
    int countUsersByRole(Long roleId);

    /**
     * 检查角色是否被使用
     */
    boolean isRoleInUse(Long roleId);

    /**
     * 启用角色
     */
    void enableRole(Long roleId);

    /**
     * 禁用角色
     */
    void disableRole(Long roleId);

    /**
     * 修改角色排序
     */
    void updateRoleOrder(Long roleId, int newOrder);
}

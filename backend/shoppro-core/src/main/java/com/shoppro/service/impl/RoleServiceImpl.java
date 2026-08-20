package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Role;
import com.shoppro.entity.RolePermission;
import com.shoppro.entity.UserRole;
import com.shoppro.repository.RolePermissionRepository;
import com.shoppro.repository.RoleRepository;
import com.shoppro.repository.UserRoleRepository;
import com.shoppro.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色服务实现
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
// @RequiredArgsConstructor
@Transactional
public class RoleServiceImpl implements RoleService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RoleServiceImpl.class);

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;

        public RoleServiceImpl(RoleRepository roleRepository,
                           RolePermissionRepository rolePermissionRepository,
                           UserRoleRepository userRoleRepository) {
        this.roleRepository = roleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    public Role createRole(Role role) {
        log.info("创建角色: {}", role.getName());
        
        // 检查角色代码和名称是否已存在
        if (roleRepository.findByCode(role.getCode()) != null) {
            throw new IllegalArgumentException("角色代码已存在: " + role.getCode());
        }
        if (roleRepository.findByName(role.getName()) != null) {
            throw new IllegalArgumentException("角色名称已存在: " + role.getName());
        }
        
        role.setStatus(1);
        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());
        
        roleRepository.insert(role);
        log.info("角色创建成功，ID: {}", role.getId());
        
        return role;
    }

    @Override
    public Role updateRole(Role role) {
        log.info("更新角色: ID={}", role.getId());
        
        // 检查名称是否被其他角色占用
        if (roleRepository.countByNameExcludeId(role.getName(), role.getId()) > 0) {
            throw new IllegalArgumentException("角色名称已被其他角色使用");
        }
        if (roleRepository.countByCodeExcludeId(role.getCode(), role.getId()) > 0) {
            throw new IllegalArgumentException("角色代码已被其他角色使用");
        }
        
        role.setUpdatedAt(LocalDateTime.now());
        roleRepository.updateById(role);
        
        log.info("角色更新成功，ID: {}", role.getId());
        return role;
    }

    @Override
    public boolean deleteRole(Long roleId) {
        log.info("删除角色: ID={}", roleId);
        
        // 删除角色权限关系
        rolePermissionRepository.deleteByRoleId(roleId);
        
        // 删除用户角色关系
        userRoleRepository.deleteByRoleId(roleId);
        
        // 删除角色
        roleRepository.deleteById(roleId);
        
        log.info("角色删除成功: ID={}", roleId);
        return true;
    }

    @Override
    public boolean softDeleteRole(Long roleId) {
        log.info("软删除角色: ID={}", roleId);
        roleRepository.softDelete(roleId);
        return true;
    }

    @Override
    public boolean restoreRole(Long roleId) {
        log.info("恢复角色: ID={}", roleId);
        roleRepository.restore(roleId);
        return true;
    }

    @Override
    public boolean deleteBatch(List<Long> roleIds) {
        log.info("批量删除角色: roleIds={}", roleIds);
        
        for (Long roleId : roleIds) {
            // 删除角色权限关系
            rolePermissionRepository.deleteByRoleId(roleId);
        }
        
        // 批量删除角色
        roleRepository.deleteBatchIds(roleIds);
        log.info("角色批量删除成功");
        
        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public Role getById(Long roleId) {
        return roleRepository.selectById(roleId);
    }

    @Override
    @Transactional(readOnly = true)
    public Role getByName(String name) {
        return roleRepository.findByName(name);
    }

    @Override
    @Transactional(readOnly = true)
    public Role getByCode(String code) {
        return roleRepository.findByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Role> pageRoles(int pageNo, int pageSize, String name, Integer status) {
        Page<Role> page = new Page<>(pageNo, pageSize);
        roleRepository.findByPage(page, name, status);
        return page;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllEnabledRoles() {
        return roleRepository.findAllEnabled();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> getUserRoles(Long userId) {
        return roleRepository.findByUserId(userId);
    }

    @Override
    public void assignRolesToUser(Long userId, List<Long> roleIds) {
        log.info("为用户分配角色: userId={}, roleIds={}", userId, roleIds);
        
        // 删除用户现有的所有角色
        userRoleRepository.deleteByUserId(userId);
        
        // 添加新的角色
        if (roleIds != null && !roleIds.isEmpty()) {
            List<UserRole> userRoles = roleIds.stream()
                .map(roleId -> new UserRole(null, userId, roleId, LocalDateTime.now(), null))
                .collect(Collectors.toList());
            userRoleRepository.insertBatch(userRoles);
        }
        
        log.info("用户角色分配完成");
    }

    @Override
    public void removeRolesFromUser(Long userId, List<Long> roleIds) {
        log.info("移除用户角色: userId={}, roleIds={}", userId, roleIds);
        
        for (Long roleId : roleIds) {
            userRoleRepository.deleteByUserAndRole(userId, roleId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<RolePermission> getRolePermissions(Long roleId) {
        return rolePermissionRepository.findByRoleId(roleId);
    }

    @Override
    public void assignPermissionsToRole(Long roleId, List<Long> permissionIds) {
        log.info("为角色分配权限: roleId={}, permissionIds={}", roleId, permissionIds);
        
        // 清空现有权限
        rolePermissionRepository.deleteByRoleId(roleId);
        
        // 添加新的权限
        if (permissionIds != null && !permissionIds.isEmpty()) {
            List<RolePermission> rolePermissions = permissionIds.stream()
                .map(permissionId -> new RolePermission(null, roleId, permissionId, LocalDateTime.now(), null))
                .collect(Collectors.toList());
            rolePermissionRepository.insertBatch(rolePermissions);
        }
        
        log.info("角色权限分配完成");
    }

    @Override
    public void removePermissionsFromRole(Long roleId, List<Long> permissionIds) {
        log.info("移除角色权限: roleId={}, permissionIds={}", roleId, permissionIds);
        
        for (Long permissionId : permissionIds) {
            rolePermissionRepository.deleteByRoleAndPermission(roleId, permissionId);
        }
    }

    @Override
    public void clearRolePermissions(Long roleId) {
        log.info("清空角色权限: roleId={}", roleId);
        rolePermissionRepository.deleteByRoleId(roleId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name, Long excludeId) {
        return roleRepository.countByNameExcludeId(name, excludeId) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String code, Long excludeId) {
        return roleRepository.countByCodeExcludeId(code, excludeId) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public int countEnabledRoles() {
        return roleRepository.countEnabled();
    }

    @Override
    @Transactional(readOnly = true)
    public int countUsersByRole(Long roleId) {
        QueryWrapper<UserRole> query = new QueryWrapper<>();
        query.eq("role_id", roleId);
        return Math.toIntExact(userRoleRepository.selectCount(query));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isRoleInUse(Long roleId) {
        // 检查是否有用户正在使用该角色
        QueryWrapper<UserRole> query = new QueryWrapper<>();
        query.eq("role_id", roleId);
        return userRoleRepository.selectCount(query) > 0;
    }

    @Override
    public void enableRole(Long roleId) {
        UpdateWrapper<Role> update = new UpdateWrapper<>();
        update.eq("id", roleId).set("status", 1).set("updated_at", LocalDateTime.now());
        roleRepository.update(null, update);
        log.info("角色已启用: ID={}", roleId);
    }

    @Override
    public void disableRole(Long roleId) {
        UpdateWrapper<Role> update = new UpdateWrapper<>();
        update.eq("id", roleId).set("status", 0).set("updated_at", LocalDateTime.now());
        roleRepository.update(null, update);
        log.info("角色已禁用: ID={}", roleId);
    }

    @Override
    public void updateRoleOrder(Long roleId, int newOrder) {
        Role role = roleRepository.selectById(roleId);
        if (role == null) {
            throw new IllegalArgumentException("角色不存在: ID=" + roleId);
        }
        role.setSortOrder(newOrder);
        role.setUpdatedAt(LocalDateTime.now());
        roleRepository.updateById(role);
        log.info("更新角色排序: ID={}, newOrder={}", roleId, newOrder);
    }
}

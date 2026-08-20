package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.Permission;
import com.shoppro.entity.RolePermission;
import com.shoppro.entity.UserRole;
import com.shoppro.repository.PermissionRepository;
import com.shoppro.repository.RolePermissionRepository;
import com.shoppro.repository.UserRoleRepository;
import com.shoppro.service.PermissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 权限服务实现
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class PermissionServiceImpl extends ServiceImpl<PermissionRepository, Permission> implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;

    private static final Logger log = LoggerFactory.getLogger(PermissionServiceImpl.class);

    public PermissionServiceImpl(PermissionRepository permissionRepository,
                                 RolePermissionRepository rolePermissionRepository,
                                 UserRoleRepository userRoleRepository) {
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Override
    @Transactional
    public Permission createPermission(Permission permission) {
        log.debug("创建权限: " + permission.getName());
        
        // 验证权限代码唯一性
        if (existsByCode(permission.getCode(), null)) {
            throw new IllegalArgumentException("权限代码已存在: " + permission.getCode());
        }
        
        // 设置默认值
        if (permission.getStatus() == null) {
            permission.setStatus(1); // 启用
        }
        if (permission.getSortOrder() == null) {
            permission.setSortOrder(0);
        }
        
        permission.setCreatedAt(LocalDateTime.now());
        permission.setUpdatedAt(LocalDateTime.now());
        
        this.save(permission);
        log.debug("权限创建成功: ID=" + permission.getId() + ", 代码=" + permission.getCode());
        return permission;
    }

    @Override
    @Transactional
    public Permission updatePermission(Permission permission) {
        log.debug("更新权限: ID=" + permission.getId() + ", 名称=" + permission.getName());
        
        Permission existing = this.getById(permission.getId());
        if (existing == null) {
            throw new IllegalArgumentException("权限不存在: " + permission.getId());
        }
        
        // 检查权限代码唯一性（排除自身）
        if (!Objects.equals(existing.getCode(), permission.getCode()) && 
            existsByCode(permission.getCode(), permission.getId())) {
            throw new IllegalArgumentException("权限代码已存在: " + permission.getCode());
        }
        
        permission.setUpdatedAt(LocalDateTime.now());
        this.updateById(permission);
        
        log.debug("权限更新成功: ID=" + permission.getId());
        return permission;
    }

    @Override
    @Transactional
    public boolean deletePermission(Long permissionId) {
        log.debug("删除权限: ID=" + permissionId);
        
        if (isPermissionInUse(permissionId)) {
            throw new IllegalArgumentException("权限正在使用中，无法删除");
        }
        
        // 删除角色权限关联
        rolePermissionRepository.delete(new LambdaQueryWrapper<RolePermission>()
                .eq(RolePermission::getPermissionId, permissionId));
        
        boolean result = this.removeById(permissionId);
        if (result) {
            log.debug("权限删除成功: ID=" + permissionId);
        }
        return result;
    }

    @Override
    @Transactional
    public boolean softDeletePermission(Long permissionId) {
        log.debug("软删除权限: ID=" + permissionId);
        
        Permission permission = this.getById(permissionId);
        if (permission == null) {
            return false;
        }
        
        permission.setDeleted(1);
        permission.setUpdatedAt(LocalDateTime.now());
        return this.updateById(permission);
    }

    @Override
    @Transactional
    public boolean restorePermission(Long permissionId) {
        log.debug("恢复权限: ID=" + permissionId);
        
        Permission permission = this.getById(permissionId);
        if (permission == null) {
            return false;
        }
        
        permission.setDeleted(0);
        permission.setUpdatedAt(LocalDateTime.now());
        return this.updateById(permission);
    }

    @Override
    @Transactional
    public boolean deleteBatch(List<Long> permissionIds) {
        log.debug("批量删除权限: " + permissionIds);
        
        // 检查是否有权限在使用
        for (Long id : permissionIds) {
            if (isPermissionInUse(id)) {
                throw new IllegalArgumentException("权限 " + id + " 正在使用中，无法删除");
            }
        }
        
        // 删除角色权限关联
        rolePermissionRepository.delete(new LambdaQueryWrapper<RolePermission>()
                .in(RolePermission::getPermissionId, permissionIds));
        
        return this.removeByIds(permissionIds);
    }

    @Override
    @Transactional(readOnly = true)
    public Permission getById(Long permissionId) {
        return this.baseMapper.selectById(permissionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Permission getByCode(String code) {
        return this.getOne(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getCode, code)
                .eq(Permission::getDeleted, 0));
    }

    @Override
    @Transactional(readOnly = true)
    public Permission getByName(String name) {
        return this.getOne(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getName, name)
                .eq(Permission::getDeleted, 0));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Permission> pagePermissions(int pageNo, int pageSize, String name, String resource, Integer status) {
        Page<Permission> page = new Page<>(pageNo, pageSize);
        
        LambdaQueryWrapper<Permission> queryWrapper = new LambdaQueryWrapper<Permission>()
                .eq(Permission::getDeleted, 0);
        
        if (name != null && !name.trim().isEmpty()) {
            queryWrapper.like(Permission::getName, name.trim());
        }
        
        if (resource != null && !resource.trim().isEmpty()) {
            queryWrapper.eq(Permission::getResource, resource.trim());
        }
        
        if (status != null) {
            queryWrapper.eq(Permission::getStatus, status);
        }
        
        queryWrapper.orderByAsc(Permission::getSortOrder).orderByAsc(Permission::getId);
        
        return this.page(page, queryWrapper);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getAllEnabledPermissions() {
        return this.list(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getStatus, 1)
                .eq(Permission::getDeleted, 0)
                .orderByAsc(Permission::getSortOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByResource(String resource) {
        return this.list(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getResource, resource)
                .eq(Permission::getDeleted, 0)
                .orderByAsc(Permission::getSortOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getUserPermissions(Long userId) {
        // 获取用户角色
        List<UserRole> userRoles = userRoleRepository.selectList(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, userId));
        
        if (userRoles.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Long> roleIds = userRoles.stream()
                .map(UserRole::getRoleId)
                .collect(Collectors.toList());
        
        // 获取角色权限
        List<RolePermission> rolePermissions = rolePermissionRepository.selectList(
                new LambdaQueryWrapper<RolePermission>().in(RolePermission::getRoleId, roleIds));
        
        if (rolePermissions.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Long> permissionIds = rolePermissions.stream()
                .map(RolePermission::getPermissionId)
                .distinct()
                .collect(Collectors.toList());
        
        // 获取权限详情
        return this.list(new LambdaQueryWrapper<Permission>()
                .in(Permission::getId, permissionIds)
                .eq(Permission::getStatus, 1)
                .eq(Permission::getDeleted, 0)
                .orderByAsc(Permission::getSortOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getUserResourcePermissions(Long userId, String resource) {
        List<Permission> userPermissions = getUserPermissions(userId);
        return userPermissions.stream()
                .filter(p -> Objects.equals(p.getResource(), resource))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getRolePermissions(Long roleId) {
        List<RolePermission> rolePermissions = rolePermissionRepository.selectList(
                new LambdaQueryWrapper<RolePermission>().eq(RolePermission::getRoleId, roleId));
        
        if (rolePermissions.isEmpty()) {
            return Collections.emptyList();
        }
        
        List<Long> permissionIds = rolePermissions.stream()
                .map(RolePermission::getPermissionId)
                .collect(Collectors.toList());
        
        return this.list(new LambdaQueryWrapper<Permission>()
                .in(Permission::getId, permissionIds)
                .eq(Permission::getDeleted, 0)
                .orderByAsc(Permission::getSortOrder));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(Long userId, String permissionCode) {
        List<Permission> permissions = getUserPermissions(userId);
        return permissions.stream().anyMatch(p -> Objects.equals(p.getCode(), permissionCode));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasResourcePermission(Long userId, String resource, String action) {
        List<Permission> permissions = getUserResourcePermissions(userId, resource);
        return permissions.stream().anyMatch(p -> Objects.equals(p.getAction(), action));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Boolean> hasPermissions(Long userId, List<String> permissionCodes) {
        Set<String> userPermissionCodes = getUserPermissions(userId).stream()
                .map(Permission::getCode)
                .collect(Collectors.toSet());
        
        return permissionCodes.stream()
                .map(userPermissionCodes::contains)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String code, Long excludeId) {
        LambdaQueryWrapper<Permission> queryWrapper = new LambdaQueryWrapper<Permission>()
                .eq(Permission::getCode, code)
                .eq(Permission::getDeleted, 0);
        
        if (excludeId != null) {
            queryWrapper.ne(Permission::getId, excludeId);
        }
        
        return this.count(queryWrapper) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public int countEnabledPermissions() {
        return Math.toIntExact(this.count(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getStatus, 1)
                .eq(Permission::getDeleted, 0)));
    }

    @Override
    @Transactional(readOnly = true)
    public Permission getByResourceAndAction(String resource, String action) {
        return this.getOne(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getResource, resource)
                .eq(Permission::getAction, action)
                .eq(Permission::getDeleted, 0));
    }

    @Override
    @Transactional(readOnly = true)
    public int countPermissionsByResource(String resource) {
        return Math.toIntExact(this.count(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getResource, resource)
                .eq(Permission::getDeleted, 0)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllResources() {
        List<Permission> permissions = this.list(new LambdaQueryWrapper<Permission>()
                .eq(Permission::getDeleted, 0)
                .select(Permission::getResource)
                .groupBy(Permission::getResource));
        
        return permissions.stream()
                .map(Permission::getResource)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void enablePermission(Long permissionId) {
        log.debug("启用权限: ID=" + permissionId);
        Permission permission = this.getById(permissionId);
        if (permission != null) {
            permission.setStatus(1);
            permission.setUpdatedAt(LocalDateTime.now());
            this.updateById(permission);
        }
    }

    @Override
    @Transactional
    public void disablePermission(Long permissionId) {
        log.debug("禁用权限: ID=" + permissionId);
        Permission permission = this.getById(permissionId);
        if (permission != null) {
            permission.setStatus(0);
            permission.setUpdatedAt(LocalDateTime.now());
            this.updateById(permission);
        }
    }

    @Override
    @Transactional
    public void updatePermissionOrder(Long permissionId, int newOrder) {
        log.debug("修改权限排序: ID=" + permissionId + ", 新排序=" + newOrder);
        Permission permission = this.getById(permissionId);
        if (permission != null) {
            permission.setSortOrder(newOrder);
            permission.setUpdatedAt(LocalDateTime.now());
            this.updateById(permission);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isPermissionInUse(Long permissionId) {
        return rolePermissionRepository.selectCount(
                new LambdaQueryWrapper<RolePermission>()
                        .eq(RolePermission::getPermissionId, permissionId)) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getPermissions(List<Long> permissionIds) {
        if (permissionIds == null || permissionIds.isEmpty()) {
            return Collections.emptyList();
        }
        
        return this.list(new LambdaQueryWrapper<Permission>()
                .in(Permission::getId, permissionIds)
                .eq(Permission::getDeleted, 0)
                .orderByAsc(Permission::getSortOrder));
    }
}
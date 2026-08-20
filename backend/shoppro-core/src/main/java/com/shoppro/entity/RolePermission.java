package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 角色权限关系表
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@TableName("role_permissions")
public class RolePermission {

    /**
     * 关系ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 角色ID
     */
    private Long roleId;

    /**
     * 权限ID
     */
    private Long permissionId;

    /**
     * 分配时间
     */
    private LocalDateTime assignedAt;

    /**
     * 分配人ID
     */
    private Long assignedBy;

        public Long getId() { return id; }
    public Long getRoleId() { return roleId; }
    public Long getPermissionId() { return permissionId; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public Long getAssignedBy() { return assignedBy; }

    public void setId(Long id) { this.id = id; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public void setPermissionId(Long permissionId) { this.permissionId = permissionId; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public void setAssignedBy(Long assignedBy) { this.assignedBy = assignedBy; }

    // 显式无参构造器
    public RolePermission() {}

    // 显式全参构造器
    public RolePermission(Long id, Long roleId, Long permissionId, LocalDateTime assignedAt, Long assignedBy) {
        this.id = id;
        this.roleId = roleId;
        this.permissionId = permissionId;
        this.assignedAt = assignedAt;
        this.assignedBy = assignedBy;
    }
}

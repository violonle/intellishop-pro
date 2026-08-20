package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 用户角色关系表
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@TableName("user_roles")
public class UserRole {

    /**
     * 关系ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 角色ID
     */
    private Long roleId;

    /**
     * 分配时间
     */
    private LocalDateTime assignedAt;

    /**
     * 分配人ID
     */
    private Long assignedBy;

        public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getRoleId() { return roleId; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public Long getAssignedBy() { return assignedBy; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public void setAssignedBy(Long assignedBy) { this.assignedBy = assignedBy; }

    // 显式无参构造器
    public UserRole() {}

    // 显式全参构造器
    public UserRole(Long id, Long userId, Long roleId, LocalDateTime assignedAt, Long assignedBy) {
        this.id = id;
        this.userId = userId;
        this.roleId = roleId;
        this.assignedAt = assignedAt;
        this.assignedBy = assignedBy;
    }
}

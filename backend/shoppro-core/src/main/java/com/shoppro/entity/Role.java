package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 角色实体
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@TableName("roles")
public class Role {

    /**
     * 角色ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 角色名称（如：admin, manager, sales, user）
     */
    private String name;

    /**
     * 角色代码（唯一标识）
     */
    private String code;

    /**
     * 角色中文名称
     */
    private String displayName;

    /**
     * 角色描述
     */
    private String description;

    /**
     * 父角色ID（用于角色继承）
     */
    private Long parentId;

    /**
     * 职级: 1-初级, 2-中级, 3-高级
     */
    private Integer level;

    /**
     * 职级名称
     */
    private String levelName;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态：1-正常，0-禁用
     */
    private Integer status;

    private String roleType;

    private String dataScope;

    @TableLogic
    private Integer deleted;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 权限列表（非表字段，用于权限关联）
     */
    private transient List<Permission> permissions;

    /**
     * 用户数量（非表字段，统计字段）
     */
    private transient Long userCount;

    public Role() {
    }

    public Role(Long id, String name, String code, String displayName, String description, Long parentId,
            Integer level, String levelName, Integer sortOrder, Integer status, LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<Permission> permissions, Long userCount) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.displayName = displayName;
        this.description = description;
        this.parentId = parentId;
        this.level = level;
        this.levelName = levelName;
        this.sortOrder = sortOrder;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.permissions = permissions;
        this.userCount = userCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public String getLevelName() {
        return levelName;
    }

    public void setLevelName(String levelName) {
        this.levelName = levelName;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getRoleType() { return roleType; }
    public void setRoleType(String roleType) { this.roleType = roleType; }
    public String getDataScope() { return dataScope; }
    public void setDataScope(String dataScope) { this.dataScope = dataScope; }

    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<Permission> permissions) {
        this.permissions = permissions;
    }

    public Long getUserCount() {
        return userCount;
    }

    public void setUserCount(Long userCount) {
        this.userCount = userCount;
    }
}

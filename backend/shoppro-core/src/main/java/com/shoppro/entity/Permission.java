package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 权限实体
 *
 * @author ShopPro Team
 * @version 1.0.0
 */

@TableName("permissions")
public class Permission {

    /**
     * 权限ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 权限名称（如：system:user:add, system:user:delete）
     */
    private String name;

    /**
     * 权限代码（唯一标识）
     */
    private String code;

    /**
     * 权限中文名称
     */
    private String displayName;

    /**
     * 权限描述
     */
    private String description;

    /**
     * 资源标识（对应URL路径或方法）
     */
    private String resource;

    /**
     * 操作类型：CREATE, READ, UPDATE, DELETE, EXECUTE等
     */
    private String action;

    /**
     * 权限分类（如：system, customer, sales, product等）
     */
    private String category;

    /**
     * 是否为系统权限：1-是，0-否
     */
    private Integer isSystem;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态：1-正常，0-禁用
     */
    private Integer status;

    /**
     * 逻辑删除标记：0-未删除，1-已删除
     */
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

    // 显式无参构造器
    public Permission() {}

    // 显式全参构造器
    public Permission(Long id, String name, String code, String displayName, String description,
                      String resource, String action, String category, Integer isSystem,
                      Integer sortOrder, Integer status, Integer deleted,
                      LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.displayName = displayName;
        this.description = description;
        this.resource = resource;
        this.action = action;
        this.category = category;
        this.isSystem = isSystem;
        this.sortOrder = sortOrder;
        this.status = status;
        this.deleted = deleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getIsSystem() { return isSystem; }
    public void setIsSystem(Integer isSystem) { this.isSystem = isSystem; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

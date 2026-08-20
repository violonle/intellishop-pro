package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("subscription_plans")
public class SubscriptionPlan {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String code;
    private String description;
    private java.math.BigDecimal price;

    @TableField("duration_days")
    private Integer durationDays;

    private String features; // JSON string

    @TableField("max_users")
    private Integer maxUsers;

    @TableField("max_storage_gb")
    private Integer maxStorageGb;

    private Integer status;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("created_at")
    private java.time.LocalDateTime createdAt;

    @TableField("updated_at")
    private java.time.LocalDateTime updatedAt;
}

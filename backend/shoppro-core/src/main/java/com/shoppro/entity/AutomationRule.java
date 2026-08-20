package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("automation_rules")
public class AutomationRule implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long tenantId;

    private String name;

    private String description;

    private String triggerEvent; // customer_created, lead_created, scheduled, etc.

    private String conditions; // JSON string

    private String actions; // JSON string

    private Boolean isActive;

    private Integer executionCount;

    private LocalDateTime lastExecutedAt;

    private Integer priority;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

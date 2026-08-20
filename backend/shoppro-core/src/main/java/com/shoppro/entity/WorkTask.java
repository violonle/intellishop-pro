package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * Sales Work Tasks Entity
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Data
@TableName("work_tasks")
public class WorkTask implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary Key
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Enterprise ID (Tenant)
     */
    private Long enterpriseId;

    /**
     * Assignee User ID
     */
    private Long userId;

    /**
     * Related Customer ID
     */
    private Long customerId;

    /**
     * Related Customer SOP ID
     */
    private Long customerSopId;

    /**
     * Type: sop, manual, ai_suggestion
     */
    private String type;

    /**
     * Task Title
     */
    private String title;

    /**
     * Task Description
     */
    private String description;

    /**
     * Status: pending, completed, cancelled
     */
    private String status;

    /**
     * Due Time
     */
    private LocalDateTime dueTime;

    /**
     * Creation Time
     */
    private LocalDateTime createdAt;

    /**
     * Update Time
     */
    private LocalDateTime updatedAt;
}

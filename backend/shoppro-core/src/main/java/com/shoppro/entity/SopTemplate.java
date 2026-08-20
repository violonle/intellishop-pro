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
 * SOP Templates Entity
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Data
@TableName("sop_templates")
public class SopTemplate implements Serializable {

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
     * SOP Name
     */
    private String name;

    /**
     * Description
     */
    private String description;

    /**
     * JSON Array of Steps
     */
    private String steps;

    /**
     * Creation Time
     */
    private LocalDateTime createdAt;

    /**
     * Update Time
     */
    private LocalDateTime updatedAt;
}

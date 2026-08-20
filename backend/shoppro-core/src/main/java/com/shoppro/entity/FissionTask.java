package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * Marketing Fission Tasks Entity
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Data
@TableName("marketing_fission")
public class FissionTask implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary Key
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long enterpriseId;

    /**
     * Fission Activity Name
     */
    private String name;

    /**
     * Type: poster, lottery, task_bot
     */
    private String type;

    /**
     * JSON Configuration
     */
    private String config;

    /**
     * Status: 1=Active, 0=Inactive
     */
    private Integer status;

    /**
     * Creation Time
     */
    private LocalDateTime createdAt;

    /**
     * Update Time
     */
    private LocalDateTime updatedAt;
}

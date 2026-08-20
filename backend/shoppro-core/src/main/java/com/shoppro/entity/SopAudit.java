package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("sop_audits")
public class SopAudit implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long tenantId;

    private Long sopTemplateId;

    private String ruleName;

    private String triggerEvent;

    private String targetType;

    private String targetName;

    private Long targetId;

    private String status; // success, failed, pending, running

    private String errorMessage;

    private LocalDateTime executedAt;

    private Integer duration;

    private LocalDateTime createdAt;
}

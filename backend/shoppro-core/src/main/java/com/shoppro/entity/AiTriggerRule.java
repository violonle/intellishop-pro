package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_trigger_rules")
public class AiTriggerRule {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String signalType;
    private String conditionExpr;
    private String actionType;
    private String actionConfig; // JSON string
    private Integer isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

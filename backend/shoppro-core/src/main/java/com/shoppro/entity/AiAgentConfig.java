package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_agent_configs")
public class AiAgentConfig {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String agentType;
    private String name;
    private String description;
    private Integer isEnabled;
    private String executionFrequency;
    private Integer triggerThreshold;
    private Integer requireConfirmation;
    private String promptTemplateCode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_agent_tasks")
public class AiAgentTask {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String agentType;
    private String title;
    private String targetType;
    private Long targetId;
    private String targetName;
    private Long assignedSalesId;
    private String assignedSalesName;
    private String generatedContent;
    private String status; // pending, confirmed, rejected, auto_executed
    private String executionResult;
    private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

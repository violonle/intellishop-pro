package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_scenarios")
public class AiScenario {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String code; // e.g., "ai_assistant"
    private String name; // e.g., "AI Intelligent Assistant"
    private String description;
    private String category; // e.g., "conversation", "analysis", "prediction"
    private String modelConfig; // JSON string for model configuration
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

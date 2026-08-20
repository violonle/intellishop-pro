package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_coaching_rules")
public class AiCoachingRule {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String keyword;
    private String scenario;
    private String suggestedResponse;
    private String actionType; // whisper, script_card
    private Integer isEnabled;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_signals")
public class AiSignal {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String signalType;
    private String title;
    private String description;
    private String targetType; // customer, lead, deal
    private Long targetId;
    private String targetName;
    private Long salesId;
    private String priority; // high, medium, low
    private String recommendedAction;
    private Integer isHandled; // 0: unhandled, 1: handled
    private LocalDateTime handledAt;
    private LocalDateTime createdAt;
}

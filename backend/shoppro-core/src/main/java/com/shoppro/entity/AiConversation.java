package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_conversations")
public class AiConversation {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    private String customerName;
    private Long leadId;
    private Long salesId;
    private String salesName;
    private String channel;
    private Integer durationSeconds;
    private String sentiment;
    private Double sentimentScore;
    private String summary;
    private String keyTopics; // JSON string
    private String actionItems; // JSON string
    private String competitorMentions; // JSON string
    private String transcript;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

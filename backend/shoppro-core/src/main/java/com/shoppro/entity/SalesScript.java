package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sales_scripts")
public class SalesScript {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;
    private String category; // greeting, introduction, objection, closing, followup
    private String content;
    private String tags; // Comma separated tags
    private Integer usageCount;
    private Double successRate;
    private LocalDateTime lastUsedAt;
    private Boolean isRecommended;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

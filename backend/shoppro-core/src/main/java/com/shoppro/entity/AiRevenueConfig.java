package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_revenue_configs")
public class AiRevenueConfig {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String stageName;
    private Double benchmarkConversionRate;
    private Integer maxStayDays;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

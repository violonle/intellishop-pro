package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("customer_personas")
public class CustomerPersona {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long customerId;
    private String tags; // JSON or comma separated
    private Integer score;
    private String analysisJson; // Detailed analysis in JSON format
    private LocalDateTime generatedAt;
}

package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_models")
public class AiModel {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String provider;
    private String version;
    private Integer status; // 1: Active, 0: Disabled
    private String rpm;
    private String apiKey;
    private String baseUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

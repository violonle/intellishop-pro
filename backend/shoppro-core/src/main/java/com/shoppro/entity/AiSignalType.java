package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_signal_types")
public class AiSignalType {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String code;
    private String name;
    private String icon;
    private String priority; // high, medium, low
    private String description;
    private Integer isEnabled;
    private LocalDateTime createdAt;
}

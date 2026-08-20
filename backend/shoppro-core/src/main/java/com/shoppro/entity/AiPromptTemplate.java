package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("ai_prompt_templates")
public class AiPromptTemplate {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String code;
    private String content;
    private String description;
    private String variables; // JSON array of variables
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

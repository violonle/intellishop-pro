package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * Channel Welcome Messages Entity
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Data
@TableName("welcome_messages")
public class WelcomeMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private Long tenantId;

    private Long channelCodeId;

    private String channelCodeName;

    private String msgType;

    private String content;

    private Boolean isActive;

    private Integer priority;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

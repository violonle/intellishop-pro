package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * <p>
 * Customer Acquisition Channel Codes Entity
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Data
@TableName("channel_codes")
public class ChannelCode implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Primary Key
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Enterprise ID (Tenant)
     */
    private Long enterpriseId;

    /**
     * Owner User ID (Sales)
     */
    private Long userId;

    /**
     * Channel Type: offline, wechat, douyin, xiaohongshu
     */
    private String channelType;

    /**
     * Channel Name
     */
    private String channelName;

    /**
     * QR Code URL or Content
     */
    private String codeUrl;

    /**
     * Description
     */
    private String description;

    /**
     * Total Scan Count
     */
    private Integer scanCount;

    /**
     * Total Follow Count
     */
    private Integer followCount;

    /**
     * Creation Time
     */
    private LocalDateTime createdAt;

    /**
     * Update Time
     */
    private LocalDateTime updatedAt;
}

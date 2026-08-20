package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

/**
 * 跟进记录实体
 * 记录与客户或线索的所有跟进活动
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@TableName("follow_up_records")
public class FollowUpRecord {

    /**
     * 跟进记录ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 线索ID (可选)
     */
    private Long leadId;

    /**
     * 客户ID (可选)
     */
    private Long customerId;

    /**
     * 跟进人ID (必需)
     */
    private Long userId;

    /**
     * 跟进方式: call(电话), email(邮件), wechat(微信), visit(拜访), sms(短信), douyin(抖音), other(其他)
     */
    private String type;

    /**
     * 跟进标题
     */
    private String title;

    /**
     * 跟进内容/备注
     */
    private String content;

    /**
     * 跟进结果: positive(正面), neutral(中性), negative(负面)
     */
    private String result;

    /**
     * 下次跟进时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextFollowUpDate;

    /**
     * 附件信息 (JSON格式)
     */
    private String attachments;

    /**
     * 跟进时长 (分钟)
     */
    private Integer duration;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    // 显式构造器
    public FollowUpRecord() {}

    public FollowUpRecord(Long id, Long leadId, Long customerId, Long userId, String type, String title,
                          String content, String result, LocalDateTime nextFollowUpDate, String attachments,
                          Integer duration, LocalDateTime createdAt) {
        this.id = id;
        this.leadId = leadId;
        this.customerId = customerId;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.content = content;
        this.result = result;
        this.nextFollowUpDate = nextFollowUpDate;
        this.attachments = attachments;
        this.duration = duration;
        this.createdAt = createdAt;
    }

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public LocalDateTime getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; }

    public String getAttachments() { return attachments; }
    public void setAttachments(String attachments) { this.attachments = attachments; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

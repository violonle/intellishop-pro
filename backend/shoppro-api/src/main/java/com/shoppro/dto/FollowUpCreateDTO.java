package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 创建跟进记录DTO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */

@Schema(name = "FollowUpCreateDTO", description = "创建跟进记录DTO")
public class FollowUpCreateDTO {

    @NotBlank(message = "跟进标题不能为空")
    @Schema(description = "跟进标题", example = "电话沟通")
    private String title;

    @NotBlank(message = "跟进方式不能为空")
    @Schema(description = "跟进方式: call/email/wechat/visit/sms/douyin/other", example = "call")
    private String type;

    @NotBlank(message = "跟进内容不能为空")
    @Schema(description = "跟进内容详情", example = "客户表示有购买意向，下周再沟通")
    private String content;

    @Schema(description = "跟进结果")
    private String result;

    // 无参构造器
    public FollowUpCreateDTO() {
    }

    // 全参构造器（覆盖全部主要字段）
    public FollowUpCreateDTO(String title, String type, String content, String result,
                             Long leadId, Long customerId, LocalDateTime nextFollowUpDate,
                             Integer duration, String attachments) {
        this.title = title;
        this.type = type;
        this.content = content;
        this.result = result;
        this.leadId = leadId;
        this.customerId = customerId;
        this.nextFollowUpDate = nextFollowUpDate;
        this.duration = duration;
        this.attachments = attachments;
    }

        public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public LocalDateTime getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getAttachments() { return attachments; }
    public void setAttachments(String attachments) { this.attachments = attachments; }

    @Schema(description = "线索ID", example = "123")
    private Long leadId;

    @Schema(description = "客户ID", example = "456")
    private Long customerId;

    @Schema(description = "下次跟进时间", example = "2024-01-20T10:00:00")
    private LocalDateTime nextFollowUpDate;

    @Schema(description = "跟进时长(分钟)", example = "15")
    private Integer duration;

    @Schema(description = "附件(JSON格式)", example = "[\"file1.pdf\", \"file2.docx\"]")
    private String attachments;
}

package com.shoppro.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * 跟进记录更新DTO
 */

@Schema(description = "跟进记录更新请求")
public class FollowUpUpdateDTO {
    @NotNull(message = "跟进记录ID不能为空")
    @Schema(description = "跟进记录ID")
    private Long id;

    @Schema(description = "跟进标题")
    private String title;

    @Schema(description = "跟进内容")
    private String content;

    @Schema(description = "跟进结果")
    private String result;

    @Schema(description = "下次跟进时间")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextFollowUpDate;

    @Schema(description = "跟进时长(分钟)")
    private Integer duration;

    @Schema(description = "附件")
    private String attachments;

    // 无参构造器
    public FollowUpUpdateDTO() {
    }

    // 全参构造器
    public FollowUpUpdateDTO(Long id, String title, String content, String result, 
                           LocalDateTime nextFollowUpDate, Integer duration, String attachments) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.result = result;
        this.nextFollowUpDate = nextFollowUpDate;
        this.duration = duration;
        this.attachments = attachments;
    }

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public LocalDateTime getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; }

    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }

    public String getAttachments() { return attachments; }
    public void setAttachments(String attachments) { this.attachments = attachments; }
}
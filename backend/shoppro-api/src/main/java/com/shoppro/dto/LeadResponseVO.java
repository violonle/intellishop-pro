package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 线索响应VO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "线索详情响应")

public class LeadResponseVO {

    @Schema(description = "线索ID", example = "1")
    private Long id;

    @Schema(description = "客户ID", example = "1")
    private Long customerId;

    @Schema(description = "线索标题", example = "客户A的购车需求")
    private String title;

    @Schema(description = "线索描述", example = "客户对A6L感兴趣")
    private String description;

    @Schema(description = "线索来源", example = "website")
    private String source;

    @Schema(description = "优先级", example = "high")
    private String priority;

    @Schema(description = "线索状态", example = "qualified")
    private String status;

    @Schema(description = "销售阶段", example = "proposal")
    private String stage;

    @Schema(description = "预估价值", example = "500000.00")
    private BigDecimal estimatedValue;

    @Schema(description = "AI预测成功率", example = "75")
    private Integer successProbability;

    @Schema(description = "感兴趣的产品列表", example = "[\"A6L\", \"Q7\"]")
    private List<String> interestedProducts;

    @Schema(description = "预算范围", example = "40-60万")
    private String budgetRange;

    @Schema(description = "决策时间线", example = "2周内")
    private String decisionTimeline;

    @Schema(description = "竞争对手信息", example = "宝马5系")
    private String competitorInfo;

    @Schema(description = "分配给", example = "1")
    private Long assignedTo;

    @Schema(description = "下次跟进日期", example = "2024-10-25")
    private LocalDate followUpDate;

    @Schema(description = "关闭时间", example = "2024-10-20T10:30:00")
    private LocalDateTime closedAt;

    @Schema(description = "创建人ID", example = "1")
    private Long createdBy;

    @Schema(description = "创建时间", example = "2024-10-20T09:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间", example = "2024-10-20T10:00:00")
    private LocalDateTime updatedAt;

    public LeadResponseVO() {}

    public LeadResponseVO(Long id, Long customerId, String title, String description,
                          String source, String priority, String status, String stage,
                          java.math.BigDecimal estimatedValue, Integer successProbability,
                          java.util.List<String> interestedProducts, String budgetRange,
                          String decisionTimeline, String competitorInfo, Long assignedTo,
                          java.time.LocalDate followUpDate, java.time.LocalDateTime closedAt,
                          Long createdBy, java.time.LocalDateTime createdAt,
                          java.time.LocalDateTime updatedAt) {
        this.id = id;
        this.customerId = customerId;
        this.title = title;
        this.description = description;
        this.source = source;
        this.priority = priority;
        this.status = status;
        this.stage = stage;
        this.estimatedValue = estimatedValue;
        this.successProbability = successProbability;
        this.interestedProducts = interestedProducts;
        this.budgetRange = budgetRange;
        this.decisionTimeline = decisionTimeline;
        this.competitorInfo = competitorInfo;
        this.assignedTo = assignedTo;
        this.followUpDate = followUpDate;
        this.closedAt = closedAt;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public java.math.BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(java.math.BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }

    public Integer getSuccessProbability() { return successProbability; }
    public void setSuccessProbability(Integer successProbability) { this.successProbability = successProbability; }

    public java.util.List<String> getInterestedProducts() { return interestedProducts; }
    public void setInterestedProducts(java.util.List<String> interestedProducts) { this.interestedProducts = interestedProducts; }

    public String getBudgetRange() { return budgetRange; }
    public void setBudgetRange(String budgetRange) { this.budgetRange = budgetRange; }

    public String getDecisionTimeline() { return decisionTimeline; }
    public void setDecisionTimeline(String decisionTimeline) { this.decisionTimeline = decisionTimeline; }

    public String getCompetitorInfo() { return competitorInfo; }
    public void setCompetitorInfo(String competitorInfo) { this.competitorInfo = competitorInfo; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public java.time.LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(java.time.LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public java.time.LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(java.time.LocalDateTime closedAt) { this.closedAt = closedAt; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 线索创建请求DTO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "线索创建请求")
public class LeadCreateDTO {

    @Schema(description = "线索标题", example = "客户A的购车需求")
    @NotBlank(message = "线索标题不能为空")
    private String title;

    @Schema(description = "线索描述", example = "客户对A6L感兴趣，预算50万")
    private String description;

    @Schema(description = "客户ID", example = "1")
    private Long customerId;

    @Schema(description = "线索来源", example = "website")
    private String source;

    @Schema(description = "优先级", example = "high")
    @NotNull(message = "优先级不能为空")
    private String priority;

    @Schema(description = "预估价值", example = "500000.00")
    private BigDecimal estimatedValue;

    @Schema(description = "感兴趣的产品列表", example = "[\"A6L\", \"Q7\"]")
    private List<String> interestedProducts;

    @Schema(description = "预算范围", example = "40-60万")
    private String budgetRange;

    @Schema(description = "决策时间线", example = "2周内")
    private String decisionTimeline;

    @Schema(description = "竞争对手信息", example = "客户同时考虑宝马5系")
    private String competitorInfo;

    @Schema(description = "分配给", example = "1")
    private Long assignedTo;

    @Schema(description = "下次跟进日期", example = "2024-10-25")
    private String followUpDate;

    public LeadCreateDTO() {
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }

    public List<String> getInterestedProducts() { return interestedProducts; }
    public void setInterestedProducts(List<String> interestedProducts) { this.interestedProducts = interestedProducts; }

    public String getBudgetRange() { return budgetRange; }
    public void setBudgetRange(String budgetRange) { this.budgetRange = budgetRange; }

    public String getDecisionTimeline() { return decisionTimeline; }
    public void setDecisionTimeline(String decisionTimeline) { this.decisionTimeline = decisionTimeline; }

    public String getCompetitorInfo() { return competitorInfo; }
    public void setCompetitorInfo(String competitorInfo) { this.competitorInfo = competitorInfo; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public String getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(String followUpDate) { this.followUpDate = followUpDate; }
}

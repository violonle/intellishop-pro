package com.shoppro.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * 线索更新请求DTO
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "线索更新请求")
public class LeadUpdateDTO {

    @Schema(description = "线索ID", example = "1")
    @NotNull(message = "线索ID不能为空")
    private Long id;

    @Schema(description = "线索标题", example = "更新后的标题")
    private String title;

    @Schema(description = "线索描述", example = "更新的描述信息")
    private String description;

    @Schema(description = "线索状态", example = "contacted")
    private String status;

    @Schema(description = "优先级", example = "high")
    private String priority;

    @Schema(description = "销售阶段", example = "negotiation")
    private String stage;

    @Schema(description = "预估价值", example = "600000.00")
    private BigDecimal estimatedValue;

    @Schema(description = "AI预测成功率", example = "75")
    private Integer successProbability;

    @Schema(description = "感兴趣的产品列表", example = "[\"A6L\", \"Q7\"]")
    private List<String> interestedProducts;

    @Schema(description = "预算范围", example = "50-70万")
    private String budgetRange;

    @Schema(description = "决策时间线", example = "1周内")
    private String decisionTimeline;

    @Schema(description = "竞争对手信息", example = "宝马5系和奔驰E级")
    private String competitorInfo;

    @Schema(description = "分配给", example = "1")
    private Long assignedTo;

    @Schema(description = "下次跟进日期", example = "2024-10-26")
    private String followUpDate;

    public LeadUpdateDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public BigDecimal getEstimatedValue() { return estimatedValue; }
    public void setEstimatedValue(BigDecimal estimatedValue) { this.estimatedValue = estimatedValue; }

    public Integer getSuccessProbability() { return successProbability; }
    public void setSuccessProbability(Integer successProbability) { this.successProbability = successProbability; }

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

package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 销售线索实体类
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@TableName(value = "leads", autoResultMap = true)
public class Lead {

    /**
     * 线索ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 关联的客户ID（可选，未转换时为空）
     */
    private Long customerId;

    /**
     * 线索标题
     */
    private String title;

    /**
     * 线索描述
     */
    private String description;

    /**
     * 线索来源
     */
    private String source;

    /**
     * 优先级：low-低, medium-中, high-高, urgent-紧急
     */
    private String priority;

    /**
     * 线索状态：new-新增, contacted-已联系, qualified-已认证, proposal-已提报, negotiation-谈判中,
     * won-已成交, lost-已流失
     */
    private String status;

    /**
     * 销售阶段
     */
    private String stage;

    /**
     * 预估价值
     */
    private BigDecimal estimatedValue;

    /**
     * AI预测成交概率（0-100）
     */
    private Integer successProbability;

    /**
     * 感兴趣的产品列表
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> interestedProducts;

    /**
     * 预算范围
     */
    private String budgetRange;

    /**
     * 决策时间线
     */
    private String decisionTimeline;

    /**
     * 竞争对手信息
     */
    private String competitorInfo;

    /**
     * 分配给（销售人员ID）
     */
    private Long assignedTo;

    private Long enterpriseId;

    /**
     * 创建人ID
     */
    private Long createdBy;

    /**
     * 下次跟进日期
     */
    private LocalDate followUpDate;

    /**
     * 关闭时间（成交或流失时填充）
     */
    private LocalDateTime closedAt;

    /**
     * 首次联系时间
     */
    @TableField(exist = false)
    private LocalDateTime firstContactTime;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除标记：0-未删除，1-已删除
     */
    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    public Lead() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public BigDecimal getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(BigDecimal estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public Integer getSuccessProbability() {
        return successProbability;
    }

    public void setSuccessProbability(Integer successProbability) {
        this.successProbability = successProbability;
    }

    public List<String> getInterestedProducts() {
        return interestedProducts;
    }

    public void setInterestedProducts(List<String> interestedProducts) {
        this.interestedProducts = interestedProducts;
    }

    public String getBudgetRange() {
        return budgetRange;
    }

    public void setBudgetRange(String budgetRange) {
        this.budgetRange = budgetRange;
    }

    public String getDecisionTimeline() {
        return decisionTimeline;
    }

    public void setDecisionTimeline(String decisionTimeline) {
        this.decisionTimeline = decisionTimeline;
    }

    public String getCompetitorInfo() {
        return competitorInfo;
    }

    public void setCompetitorInfo(String competitorInfo) {
        this.competitorInfo = competitorInfo;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Long getEnterpriseId() {
        return enterpriseId;
    }

    public void setEnterpriseId(Long enterpriseId) {
        this.enterpriseId = enterpriseId;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public LocalDateTime getFirstContactTime() {
        return firstContactTime;
    }

    public void setFirstContactTime(LocalDateTime firstContactTime) {
        this.firstContactTime = firstContactTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }
}

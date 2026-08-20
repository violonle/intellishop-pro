package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.time.LocalDateTime;

@TableName("lead_transfers")
public class LeadTransfer {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long leadId;

    private Long fromUserId;

    private Long toUserId;

    private String reason;

    private Long transferredBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    public LeadTransfer() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }

    public Long getFromUserId() { return fromUserId; }
    public void setFromUserId(Long fromUserId) { this.fromUserId = fromUserId; }

    public Long getToUserId() { return toUserId; }
    public void setToUserId(Long toUserId) { this.toUserId = toUserId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getTransferredBy() { return transferredBy; }
    public void setTransferredBy(Long transferredBy) { this.transferredBy = transferredBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

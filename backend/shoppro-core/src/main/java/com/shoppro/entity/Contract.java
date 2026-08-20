package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("contracts")
public class Contract {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String contractNo;

    private String title;

    private Long customerId;

    private String customerName;

    private Long leadId;

    private BigDecimal amount;

    private String status;

    private LocalDate signDate;

    private LocalDate startDate;

    private LocalDate endDate;

    private String attachmentUrl;

    private String terms;

    private String paymentTerms;

    private String notes;

    @TableField("created_by")
    private Long createdBy;

    @TableField("assigned_to")
    private Long assignedTo;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}

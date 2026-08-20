package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("invoices")
public class Invoice {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String invoiceNo;

    private Long orderId;

    private String orderNo;

    private Long customerId;

    private String customerName;

    private String type;

    private String status;

    private BigDecimal amount;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private String taxRate;

    private LocalDate issueDate;

    private LocalDate dueDate;

    private LocalDate actualPaymentDate;

    private String title;

    private String taxNumber;

    private String bankName;

    private String bankAccount;

    private String address;

    private String phone;

    private String email;

    private String billingType;

    private String content;

    private String remark;

    private String attachmentUrl;

    private String paymentStatus;

    private String invoiceUrl;

    @TableField("created_by")
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer deleted;
}

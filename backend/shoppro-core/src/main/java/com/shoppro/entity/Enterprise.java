package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("enterprises")
public class Enterprise {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    @TableField(exist = false)
    private String shortName;

    @TableField("code")
    private String code;

    @TableField(exist = false)
    private String socialCode;

    @TableField("legal_name")
    private String legalName;

    @TableField("contact_person")
    private String contact;

    @TableField("contact_phone")
    private String phone;

    @TableField("contact_email")
    private String email;

    private String address;

    @TableField("logo_url")
    private String logoUrl;

    private Integer status; // 1: Active, 0: Suspended

    @TableField(exist = false)
    private String rejectReason;

    @TableField("subscription_plan_id")
    private Long subscriptionPlanId;

    @TableField("subscription_expire_at")
    private LocalDateTime subscriptionExpireAt;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;
}

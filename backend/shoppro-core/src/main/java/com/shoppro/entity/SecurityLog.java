package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("security_logs")
public class SecurityLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("username")
    private String username;

    @TableField("action")
    private String action;

    @TableField("ip_address")
    private String ipAddress;

    @TableField("user_agent")
    private String userAgent;

    @TableField("resource")
    private String resource;

    @TableField("result")
    private String result;

    @TableField("failure_reason")
    private String failureReason;

    @TableField("extra_data")
    private String extraData;

    @TableField("created_at")
    private LocalDateTime createdAt;

    public static final String ACTION_LOGIN = "LOGIN";
    public static final String ACTION_LOGIN_SUCCESS = "LOGIN_SUCCESS";
    public static final String ACTION_LOGIN_FAIL = "LOGIN_FAIL";
    public static final String ACTION_LOGOUT = "LOGOUT";
    public static final String ACTION_PASSWORD_CHANGE = "PASSWORD_CHANGE";
    public static final String ACTION_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String ACTION_PERMISSION_DENIED = "PERMISSION_DENIED";
    public static final String ACTION_SENSITIVE_DATA_ACCESS = "SENSITIVE_DATA_ACCESS";
    public static final String ACTION_SENSITIVE_DATA_EXPORT = "SENSITIVE_DATA_EXPORT";
    public static final String ACTION_RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
}

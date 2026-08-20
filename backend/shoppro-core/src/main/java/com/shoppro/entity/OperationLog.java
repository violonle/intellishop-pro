package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("operate_logs")
public class OperationLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private Long userId;

    @TableField("user_name")
    private String username;

    @TableField("ip")
    private String ipAddress;

    @TableField("title")
    private String module;

    @TableField("method")
    private String action;

    @TableField("status")
    private Integer status; // 0=SUCCESS, 1=FAIL (根据通用惯例)

    @TableField(exist = false)
    private String result; // 响应前端：SUCCESS, FAILED

    @TableField("created_at")
    private LocalDateTime createdAt;

    public String getResult() {
        return status != null && status == 0 ? "SUCCESS" : "FAILED";
    }
}

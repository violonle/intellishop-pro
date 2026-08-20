package com.shoppro.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;

/**
 * 用户登录请求DTO
 * 支持用户名、手机号、邮箱等方式登录
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Schema(description = "用户登录请求")
public class LoginRequest {

    public LoginRequest() {
    }

    /**
     * 用户名、手机号或邮箱
     */
    @NotBlank(message = "用户名/手机号/邮箱不能为空")
    @Schema(description = "用户名、手机号或邮箱", example = "admin")
    private String username;

    /**
     * 密码
     */
    @NotBlank(message = "密码不能为空")
    @Schema(description = "密码", example = "请输入登录密码")
    private String password;

    /**
     * 是否记住我（可选）
     */
    @Schema(description = "是否记住我", example = "false")
    private Boolean rememberMe;

    /**
     * 系统标识：ADMIN(后台), APP(主站)
     */
    @Schema(description = "系统标识：ADMIN(后台), APP(主站)", example = "APP")
    private String sysCode;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(Boolean rememberMe) {
        this.rememberMe = rememberMe;
    }

    public String getSysCode() {
        return sysCode;
    }

    public void setSysCode(String sysCode) {
        this.sysCode = sysCode;
    }
}

package com.shoppro.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 用户登录请求DTO
 */

public class UserLoginRequest {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    // 无参构造器
    public UserLoginRequest() {
    }

    // 全参构造器
    public UserLoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

        public String getUsername() { return username; }
    
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    
    public void setPassword(String password) { this.password = password; }
}
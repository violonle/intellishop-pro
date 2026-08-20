package com.shoppro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 用户注册请求DTO
 */

public class UserRegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度需3-50字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 100, message = "密码长度需6-100字符")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "真实姓名不能为空")
    private String realName;

    private String phone;

    // 无参构造器
    public UserRegisterRequest() {
    }

    // 全参构造器
    public UserRegisterRequest(String username, String password, String email, String realName, String phone) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.realName = realName;
        this.phone = phone;
    }

        public String getUsername() { return username; }
    
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    
    public void setEmail(String email) { this.email = email; }
    
    public String getRealName() { return realName; }
    
    public void setRealName(String realName) { this.realName = realName; }
    
    public String getPhone() { return phone; }
    
    public void setPhone(String phone) { this.phone = phone; }
}

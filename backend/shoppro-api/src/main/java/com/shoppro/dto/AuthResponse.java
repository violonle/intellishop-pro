package com.shoppro.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * 登录认证响应
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long expiresIn;
    private UserResponse user;
    private Integer code;
    private String message;

    // 显式无参构造器
    public AuthResponse() {}

    // 显式全参构造器
    public AuthResponse(String token, String refreshToken, Long expiresIn, UserResponse user, Integer code, String message) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
        this.code = code;
        this.message = message;
    }

        public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public Long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }

    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }

    public Integer getCode() { return code; }
    public void setCode(Integer code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
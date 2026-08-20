package com.shoppro.service;

import com.shoppro.dto.request.LoginRequest;
import com.shoppro.dto.request.RegisterRequest;
import com.shoppro.dto.response.LoginResponse;

/**
 * 认证业务接口
 * 定义用户认证相关的业务方法
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface AuthService {

    /**
     * 用户登录
     *
     * @param request 登录请求
     * @return 登录响应（包含token和用户信息）
     * @throws Exception 登录失败时抛出异常
     */
    LoginResponse login(LoginRequest request) throws Exception;

    /**
     * 用户注册
     *
     * @param request 注册请求
     * @return 登录响应（自动登录）
     * @throws Exception 注册失败时抛出异常
     */
    LoginResponse register(RegisterRequest request) throws Exception;

    /**
     * 刷新Token
     *
     * @param token 带有Bearer前缀的刷新令牌或访问令牌
     * @return 登录响应（包含新的access token）
     * @throws Exception 刷新失败时抛出异常
     */
    LoginResponse refreshToken(String token) throws Exception;

    /**
     * 用户登出
     *
     * @param token 带有Bearer前缀的访问令牌
     */
    void logout(String token);

    /**
     * 发送验证码
     *
     * @param phone 手机号
     * @throws Exception 发送失败时抛出异常
     */
    void sendVerificationCode(String phone) throws Exception;

    /**
     * 验证验证码
     *
     * @param phone 手机号
     * @param code 验证码
     * @return 验证码是否正确
     */
    boolean verifyCode(String phone, String code);

    /**
     * 重置密码
     *
     * @param phone 手机号
     * @param newPassword 新密码
     * @throws Exception 重置失败时抛出异常
     */
    void resetPassword(String phone, String newPassword) throws Exception;

    /**
     * 修改密码
     *
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @throws Exception 修改失败时抛出异常
     */
    void changePassword(Long userId, String oldPassword, String newPassword) throws Exception;
}

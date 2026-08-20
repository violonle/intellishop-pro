package com.shoppro.controller;

import com.shoppro.dto.request.LoginRequest;
import com.shoppro.dto.request.RegisterRequest;
import com.shoppro.dto.request.VerifyCodeRequest;
import com.shoppro.dto.response.ApiResponse;
import com.shoppro.dto.response.LoginResponse;
import com.shoppro.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 认证控制器
 * 处理用户登录、注册、验证码等认证相关请求
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/auth")
@Validated
@Tag(name = "认证管理", description = "用户认证相关API")
public class AuthController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "使用手机号/用户名和密码登录")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("用户登录请求: {}", request.getUsername());

        try {
            LoginResponse response = authService.login(request);
            log.info("用户登录成功: {}", request.getUsername());
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("用户登录失败: {}, 错误: {}", request.getUsername(), e.getMessage());
            return ApiResponse.error("登录失败: " + e.getMessage());
        }
    }

    /**
     * 发送验证码
     */
    @PostMapping("/send-code")
    @Operation(summary = "发送验证码", description = "向指定手机号发送验证码")
    public ApiResponse<String> sendVerificationCode(@RequestParam String phone) {
        log.info("发送验证码请求: {}", phone);

        try {
            authService.sendVerificationCode(phone);
            log.info("验证码发送成功: {}", phone);
            return ApiResponse.success("验证码发送成功");
        } catch (Exception e) {
            log.error("验证码发送失败: {}, 错误: {}", phone, e.getMessage());
            return ApiResponse.error("验证码发送失败: " + e.getMessage());
        }
    }

    /**
     * 验证验证码
     */
    @PostMapping("/verify-code")
    @Operation(summary = "验证验证码", description = "验证手机验证码是否正确")
    public ApiResponse<String> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        log.info("验证码验证请求: {}", request.getPhone());

        try {
            boolean isValid = authService.verifyCode(request.getPhone(), request.getCode());
            if (isValid) {
                log.info("验证码验证成功: {}", request.getPhone());
                return ApiResponse.success("验证码验证成功");
            } else {
                log.warn("验证码验证失败: {}", request.getPhone());
                return ApiResponse.error("验证码错误或已过期");
            }
        } catch (Exception e) {
            log.error("验证码验证异常: {}, 错误: {}", request.getPhone(), e.getMessage());
            return ApiResponse.error("验证失败: " + e.getMessage());
        }
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "注册新用户账号")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("用户注册请求: {}", request.getPhone());

        try {
            // 先验证验证码
            boolean codeValid = authService.verifyCode(request.getPhone(), request.getVerifyCode());
            if (!codeValid) {
                return ApiResponse.error("验证码错误或已过期");
            }

            LoginResponse response = authService.register(request);
            log.info("用户注册成功: {}", request.getPhone());
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("用户注册失败: {}, 错误: {}", request.getPhone(), e.getMessage());
            return ApiResponse.error("注册失败: " + e.getMessage());
        }
    }

    /**
     * 刷新Token
     */
    @PostMapping("/refresh")
    @Operation(summary = "刷新Token", description = "刷新用户访问令牌")
    public ApiResponse<LoginResponse> refreshToken(@RequestHeader("Authorization") String token) {
        log.info("Token刷新请求");

        try {
            LoginResponse response = authService.refreshToken(token);
            log.info("Token刷新成功");
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("Token刷新失败: {}", e.getMessage());
            return ApiResponse.error("Token刷新失败: " + e.getMessage());
        }
    }

    /**
     * 用户登出
     */
    @PostMapping("/logout")
    @Operation(summary = "用户登出", description = "退出登录")
    public ApiResponse<String> logout(@RequestHeader("Authorization") String token) {
        log.info("用户登出请求");

        try {
            authService.logout(token);
            log.info("用户登出成功");
            return ApiResponse.success("登出成功");
        } catch (Exception e) {
            log.error("用户登出失败: {}", e.getMessage());
            return ApiResponse.error("登出失败: " + e.getMessage());
        }
    }

    /**
     * 忘记密码
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "忘记密码", description = "通过手机号重置密码")
    public ApiResponse<String> forgotPassword(@RequestParam String phone,
            @RequestParam String code,
            @RequestParam String newPassword) {
        log.info("忘记密码请求: {}", phone);

        try {
            // 验证验证码
            boolean codeValid = authService.verifyCode(phone, code);
            if (!codeValid) {
                return ApiResponse.error("验证码错误或已过期");
            }

            authService.resetPassword(phone, newPassword);
            log.info("密码重置成功: {}", phone);
            return ApiResponse.success("密码重置成功");
        } catch (Exception e) {
            log.error("密码重置失败: {}, 错误: {}", phone, e.getMessage());
            return ApiResponse.error("密码重置失败: " + e.getMessage());
        }
    }

}

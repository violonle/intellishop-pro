package com.shoppro.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * 通用API响应包装类
 * 
 * @author ShopPro Team
 * @version 1.0.0
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * 响应状态码
     */
    private Integer code;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 响应时间戳
     */
    private LocalDateTime timestamp;

    /**
     * 请求追踪ID
     */
    private String traceId;

        public ApiResponse() {}

        public ApiResponse(Integer code, String message, T data, LocalDateTime timestamp, String traceId) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
        this.traceId = traceId;
    }

    /**
     * 成功响应构造方法
     */
    public ApiResponse(T data) {
        this.code = 200;
        this.message = "success";
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * 失败响应构造方法
     */
    public ApiResponse(Integer code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

        public Integer getCode() { return code; }
    public void setCode(Integer code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }

    /**
     * 创建成功响应
     */
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(200, "success");
    }

    /**
     * 创建成功响应（带数据）
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(data);
    }

    /**
     * 创建成功响应（带数据和消息）
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>(data);
        response.message = message;
        return response;
    }

    /**
     * 创建失败响应
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(400, message);
    }

    /**
     * 创建失败响应（带状态码）
     */
    public static <T> ApiResponse<T> error(Integer code, String message) {
        return new ApiResponse<>(code, message);
    }

    /**
     * 创建失败响应（消息在前，状态码在后）以兼容调用
     */
    public static <T> ApiResponse<T> error(String message, Integer code) {
        return new ApiResponse<>(code, message);
    }

    /**
     * 创建失败响应（带详细数据）
     */
    public static <T> ApiResponse<T> error(String message, Integer code, T data) {
        ApiResponse<T> response = new ApiResponse<>(code, message);
        response.data = data;
        return response;
    }

    /**
     * 创建未授权响应
     */
    public static <T> ApiResponse<T> unauthorized() {
        return new ApiResponse<>(401, "未授权访问");
    }

    /**
     * 创建未授权响应（带消息）
     */
    public static <T> ApiResponse<T> unauthorized(String message) {
        return new ApiResponse<>(401, message);
    }

    /**
     * 创建禁止访问响应
     */
    public static <T> ApiResponse<T> forbidden() {
        return new ApiResponse<>(403, "禁止访问");
    }

    /**
     * 创建禁止访问响应（带消息）
     */
    public static <T> ApiResponse<T> forbidden(String message) {
        return new ApiResponse<>(403, message);
    }

    /**
     * 创建资源未找到响应
     */
    public static <T> ApiResponse<T> notFound() {
        return new ApiResponse<>(404, "资源未找到");
    }

    /**
     * 创建资源未找到响应（带消息）
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(404, message);
    }

    /**
     * 创建服务器内部错误响应
     */
    public static <T> ApiResponse<T> serverError() {
        return new ApiResponse<>(500, "服务器内部错误");
    }

    /**
     * 创建服务器内部错误响应（带消息）
     */
    public static <T> ApiResponse<T> serverError(String message) {
        return new ApiResponse<>(500, message);
    }

    /**
     * 判断响应是否成功
     */
    public boolean isSuccess() {
        return this.code != null && this.code == 200;
    }

    /**
     * 设置追踪ID
     */
    public ApiResponse<T> withTraceId(String traceId) {
        this.traceId = traceId;
        return this;
    }
}
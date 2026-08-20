package com.shoppro.service.integration;

import java.util.Map;

/**
 * 第三方集成管理服务接口
 * 统一管理所有第三方集成（企业微信、钉钉、短信、邮件、支付）
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface IntegrationService {

    /**
     * 获取集成配置
     */
    Map<String, Object> getIntegrationConfig(String type);

    /**
     * 更新集成配置
     */
    boolean updateIntegrationConfig(String type, Map<String, Object> config);

    /**
     * 测试集成连接
     */
    boolean testIntegrationConnection(String type);

    /**
     * 获取所有集成状态
     */
    Map<String, Map<String, Object>> getAllIntegrationStatus();

    /**
     * 记录集成日志
     */
    void logIntegration(String type, String action, String result, String details);

    /**
     * 获取集成日志
     */
    java.util.List<Map<String, Object>> getIntegrationLogs(String type, int limit);

    /**
     * 处理集成错误
     */
    void handleIntegrationError(String type, String errorCode, String errorMessage);

    /**
     * 获取错误统计
     */
    Map<String, Long> getErrorStatistics(String type);
}

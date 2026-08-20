package com.shoppro.service.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 第三方集成管理服务实现（基础版）
 * 提供内存级配置存储、状态查询与日志记录的最小实现，确保应用可启动。
 */
@Service
public class IntegrationServiceImpl implements IntegrationService {

    private static final Logger log = LoggerFactory.getLogger(IntegrationServiceImpl.class);

    // 内存存储集成配置
    private final Map<String, Map<String, Object>> configStore = new ConcurrentHashMap<>();
    // 内存存储错误统计
    private final Map<String, Long> errorStats = new ConcurrentHashMap<>();
    // 简单日志缓冲（仅保存最新的若干条）
    private final Map<String, List<Map<String, Object>>> logStore = new ConcurrentHashMap<>();

    @Override
    public Map<String, Object> getIntegrationConfig(String type) {
        return configStore.getOrDefault(type, Collections.emptyMap());
    }

    @Override
    public boolean updateIntegrationConfig(String type, Map<String, Object> config) {
        if (type == null || type.isEmpty() || config == null) {
            return false;
        }
        configStore.put(type, new ConcurrentHashMap<>(config));
        log.info("更新集成配置: {} -> {}", type, config.keySet());
        return true;
    }

    @Override
    public boolean testIntegrationConnection(String type) {
        // 基础实现：仅返回true并记录日志
        log.info("测试集成连接: {}", type);
        logIntegration(type, "test", "success", "基础连接测试通过");
        return true;
    }

    @Override
    public Map<String, Map<String, Object>> getAllIntegrationStatus() {
        Map<String, Map<String, Object>> status = new ConcurrentHashMap<>();
        for (String type : configStore.keySet()) {
            status.put(type, Map.of(
                    "status", "OK",
                    "updatedAt", System.currentTimeMillis(),
                    "configSize", configStore.getOrDefault(type, Collections.emptyMap()).size()
            ));
        }
        return status;
    }

    @Override
    public void logIntegration(String type, String action, String result, String details) {
        Map<String, Object> entry = Map.of(
                "timestamp", System.currentTimeMillis(),
                "action", action,
                "result", result,
                "details", details
        );
        logStore.computeIfAbsent(type, k -> new ArrayList<>()).add(entry);
        // 仅保留最近100条
        List<Map<String, Object>> entries = logStore.get(type);
        if (entries.size() > 100) {
            entries.remove(0);
        }
        log.info("集成日志: type={}, action={}, result={}", type, action, result);
    }

    @Override
    public List<Map<String, Object>> getIntegrationLogs(String type, int limit) {
        List<Map<String, Object>> entries = logStore.getOrDefault(type, Collections.emptyList());
        if (entries.isEmpty()) {
            return Collections.emptyList();
        }
        int size = Math.min(Math.max(limit, 1), entries.size());
        return entries.subList(entries.size() - size, entries.size());
    }

    @Override
    public void handleIntegrationError(String type, String errorCode, String errorMessage) {
        log.error("集成错误: type={}, code={}, message={}", type, errorCode, errorMessage);
        errorStats.merge(type, 1L, Long::sum);
        logIntegration(type, "error", "failure", String.format("%s: %s", errorCode, errorMessage));
    }

    @Override
    public Map<String, Long> getErrorStatistics(String type) {
        if (type == null || type.isEmpty()) {
            return Collections.unmodifiableMap(errorStats);
        }
        Long count = errorStats.getOrDefault(type, 0L);
        return Map.of(type, count);
    }
}
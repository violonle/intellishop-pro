package com.shoppro.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.util.*;

/**
 * 文件存储管理器
 * 支持多种存储策略的统一接口，提供文件验证、签名、缓存等增强功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class StorageManager {

    private static final Logger log = LoggerFactory.getLogger(StorageManager.class);

    @Value("${file.storage.type:local}")
    private String storageType;

    @Value("${file.upload.max-size:10485760}")
    private long maxFileSize;

    @Value("${file.upload.allowed-types:jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt}")
    private String allowedTypes;

    @Autowired(required = false)
    private LocalStorageStrategy localStorage;

    @Autowired(required = false)
    private CloudStorageStrategy cloudStorage;

    private final Map<String, Long> fileAccessCache = new HashMap<>();

    /**
     * 上传文件（带验证）
     */
    public String uploadFile(String fileName, InputStream inputStream, long fileSize, String contentType) {
        // 验证文件大小
        if (fileSize > maxFileSize) {
            throw new IllegalArgumentException("文件大小超过限制: " + maxFileSize + "字节");
        }

        // 验证文件类型
        String fileExtension = getFileExtension(fileName);
        if (!isAllowedFileType(fileExtension)) {
            throw new IllegalArgumentException("不支持的文件类型: " + fileExtension);
        }

        // 获取存储策略
        StorageStrategy strategy = getStorageStrategy();

        try {
            // 执行上传
            String fileUrl = strategy.upload(fileName, inputStream, fileSize, contentType);

            log.info("文件上传成功: {} (大小: {}字节, 存储: {})", fileName, fileSize, strategy.getStrategyName());

            return fileUrl;

        } catch (Exception e) {
            log.error("文件上传失败: {}", fileName, e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 下载文件
     */
    public InputStream downloadFile(String fileKey) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            // 检查文件是否存在
            if (!strategy.exists(fileKey)) {
                throw new IllegalArgumentException("文件不存在: " + fileKey);
            }

            // 更新访问计数
            updateFileAccessCount(fileKey);

            return strategy.download(fileKey);

        } catch (Exception e) {
            log.error("文件下载失败: {}", fileKey, e);
            throw new RuntimeException("文件下载失败: " + e.getMessage());
        }
    }

    /**
     * 删除文件
     */
    public boolean deleteFile(String fileKey) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            boolean result = strategy.delete(fileKey);

            if (result) {
                log.info("文件删除成功: {}", fileKey);
                fileAccessCache.remove(fileKey);
            }

            return result;

        } catch (Exception e) {
            log.error("文件删除失败: {}", fileKey, e);
            return false;
        }
    }

    /**
     * 批量删除文件
     */
    public int deleteFileBatch(List<String> fileKeys) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            int result = strategy.deleteBatch(fileKeys);

            // 清除缓存
            for (String fileKey : fileKeys) {
                fileAccessCache.remove(fileKey);
            }

            return result;

        } catch (Exception e) {
            log.error("批量删除文件失败", e);
            return 0;
        }
    }

    /**
     * 检查文件是否存在
     */
    public boolean fileExists(String fileKey) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            return strategy.exists(fileKey);

        } catch (Exception e) {
            log.error("检查文件存在失败: {}", fileKey, e);
            return false;
        }
    }

    /**
     * 获取文件大小
     */
    public long getFileSize(String fileKey) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            return strategy.getFileSize(fileKey);

        } catch (Exception e) {
            log.error("获取文件大小失败: {}", fileKey, e);
            return -1;
        }
    }

    /**
     * 获取文件元数据
     */
    public Map<String, Object> getFileMetadata(String fileKey) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            return strategy.getMetadata(fileKey);

        } catch (Exception e) {
            log.error("获取文件元数据失败: {}", fileKey, e);
            return new HashMap<>();
        }
    }

    /**
     * 获取文件签名URL（用于临时访问）
     */
    public String getSignedUrl(String fileKey, int expirationSeconds) {
        StorageStrategy strategy = getStorageStrategy();

        try {
            return strategy.getSignedUrl(fileKey, expirationSeconds);

        } catch (Exception e) {
            log.error("生成签名URL失败: {}", fileKey, e);
            return "";
        }
    }

    /**
     * 获取当前存储策略
     */
    public String getActiveStorageType() {
        return storageType;
    }

    /**
     * 获取存储策略名称
     */
    public String getStorageStrategyName() {
        StorageStrategy strategy = getStorageStrategy();
        return strategy.getStrategyName();
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 获取存储策略实例
     */
    private StorageStrategy getStorageStrategy() {
        switch (storageType.toLowerCase()) {
            case "cloud":
                if (cloudStorage == null) {
                    throw new IllegalStateException("云存储未配置");
                }
                return cloudStorage;
            case "local":
            default:
                if (localStorage == null) {
                    throw new IllegalStateException("本地存储未配置");
                }
                return localStorage;
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        if (lastDot > 0 && lastDot < fileName.length() - 1) {
            return fileName.substring(lastDot + 1).toLowerCase();
        }
        return "";
    }

    /**
     * 检查文件类型是否允许
     */
    private boolean isAllowedFileType(String fileExtension) {
        if (fileExtension.isEmpty()) {
            return false;
        }

        String[] types = allowedTypes.split(",");
        for (String type : types) {
            if (type.trim().equalsIgnoreCase(fileExtension)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 更新文件访问计数
     */
    private void updateFileAccessCount(String fileKey) {
        fileAccessCache.put(fileKey, System.currentTimeMillis());
    }

    /**
     * 获取文件访问统计
     */
    public Map<String, Object> getAccessStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAccessedFiles", fileAccessCache.size());
        stats.put("lastAccessTime", fileAccessCache.values().stream()
            .max(Long::compareTo)
            .orElse(0L));
        stats.put("cacheSize", fileAccessCache.size());
        return stats;
    }

    /**
     * 清空访问缓存
     */
    public void clearAccessCache() {
        fileAccessCache.clear();
        log.info("文件访问缓存已清空");
    }
}

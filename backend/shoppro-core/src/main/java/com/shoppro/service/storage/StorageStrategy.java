package com.shoppro.service.storage;

import java.io.InputStream;
import java.util.Map;

/**
 * 存储策略接口
 * 定义统一的文件存储接口，支持多种存储实现
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface StorageStrategy {

    /**
     * 上传文件
     *
     * @param fileName 文件名
     * @param inputStream 文件流
     * @param fileSize 文件大小
     * @param contentType 文件类型
     * @return 文件URL或标识符
     */
    String upload(String fileName, InputStream inputStream, long fileSize, String contentType);

    /**
     * 下载文件
     *
     * @param fileKey 文件键值
     * @return 文件流
     */
    InputStream download(String fileKey);

    /**
     * 删除文件
     *
     * @param fileKey 文件键值
     * @return 是否删除成功
     */
    boolean delete(String fileKey);

    /**
     * 检查文件是否存在
     *
     * @param fileKey 文件键值
     * @return 是否存在
     */
    boolean exists(String fileKey);

    /**
     * 获取文件大小
     *
     * @param fileKey 文件键值
     * @return 文件大小（字节）
     */
    long getFileSize(String fileKey);

    /**
     * 获取文件元数据
     *
     * @param fileKey 文件键值
     * @return 元数据Map
     */
    Map<String, Object> getMetadata(String fileKey);

    /**
     * 获取文件签名URL（用于临时访问）
     *
     * @param fileKey 文件键值
     * @param expirationSeconds 过期时间（秒）
     * @return 签名URL
     */
    String getSignedUrl(String fileKey, int expirationSeconds);

    /**
     * 批量删除文件
     *
     * @param fileKeys 文件键值列表
     * @return 成功删除的文件数
     */
    int deleteBatch(java.util.List<String> fileKeys);

    /**
     * 获取存储策略名称
     *
     * @return 策略名称
     */
    String getStrategyName();
}

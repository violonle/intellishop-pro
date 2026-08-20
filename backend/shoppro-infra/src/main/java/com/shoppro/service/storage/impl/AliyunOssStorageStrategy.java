package com.shoppro.service.storage.impl;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.aliyun.oss.model.*;
import com.shoppro.service.storage.StorageStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import java.io.InputStream;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
@ConditionalOnProperty(name = "cloud.storage.provider", havingValue = "aliyun")
public class AliyunOssStorageStrategy implements StorageStrategy {

    private static final Logger log = LoggerFactory.getLogger(AliyunOssStorageStrategy.class);

    @Value("${cloud.storage.aliyun.endpoint:}")
    private String endpoint;

    @Value("${cloud.storage.aliyun.access-key-id:}")
    private String accessKeyId;

    @Value("${cloud.storage.aliyun.access-key-secret:}")
    private String accessKeySecret;

    @Value("${cloud.storage.aliyun.bucket-name:}")
    private String bucketName;

    @Value("${cloud.storage.aliyun.base-url:}")
    private String baseUrl;

    private OSS ossClient;

    @PostConstruct
    public void init() {
        log.info("初始化阿里云OSS客户端: endpoint={}, bucket={}", endpoint, bucketName);
        ossClient = new OSSClientBuilder().build(endpoint, accessKeyId, accessKeySecret);
        log.info("阿里云OSS客户端初始化成功");
    }

    @PreDestroy
    public void destroy() {
        if (ossClient != null) {
            ossClient.shutdown();
            log.info("阿里云OSS客户端已关闭");
        }
    }

    @Override
    public String upload(String fileName, InputStream inputStream, long fileSize, String contentType) {
        try {
            log.info("上传文件到阿里云OSS: {} ({}字节)", fileName, fileSize);

            String objectKey = generateObjectKey(fileName);

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(fileSize);
            if (contentType != null) {
                metadata.setContentType(contentType);
            }
            metadata.setUserMetadata(Map.of("original-filename", fileName));

            PutObjectRequest putRequest = new PutObjectRequest(
                    bucketName,
                    objectKey,
                    inputStream,
                    metadata
            );

            ossClient.putObject(putRequest);

            String fileUrl = getFileUrl(objectKey);
            log.info("文件上传成功: objectKey={}, url={}", objectKey, fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("阿里云OSS上传失败: {}", fileName, e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public InputStream download(String fileKey) {
        try {
            log.info("从阿里云OSS下载文件: {}", fileKey);

            String objectKey = extractObjectKey(fileKey);
            OSSObject ossObject = ossClient.getObject(bucketName, objectKey);
            return ossObject.getObjectContent();

        } catch (Exception e) {
            log.error("阿里云OSS下载失败: {}", fileKey, e);
            throw new RuntimeException("文件下载失败: " + e.getMessage());
        }
    }

    @Override
    public boolean delete(String fileKey) {
        try {
            log.info("从阿里云OSS删除文件: {}", fileKey);

            String objectKey = extractObjectKey(fileKey);
            ossClient.deleteObject(bucketName, objectKey);
            log.info("文件删除成功: {}", objectKey);
            return true;

        } catch (Exception e) {
            log.error("阿里云OSS删除失败: {}", fileKey, e);
            return false;
        }
    }

    @Override
    public boolean exists(String fileKey) {
        try {
            String objectKey = extractObjectKey(fileKey);
            return ossClient.doesObjectExist(bucketName, objectKey);
        } catch (Exception e) {
            log.error("检查文件存在失败: {}", fileKey, e);
            return false;
        }
    }

    @Override
    public long getFileSize(String fileKey) {
        try {
            String objectKey = extractObjectKey(fileKey);
            ObjectMetadata metadata = ossClient.getObjectMetadata(bucketName, objectKey);
            return metadata.getContentLength();
        } catch (Exception e) {
            log.error("获取文件大小失败: {}", fileKey, e);
            return -1;
        }
    }

    @Override
    public Map<String, Object> getMetadata(String fileKey) {
        try {
            String objectKey = extractObjectKey(fileKey);
            ObjectMetadata metadata = ossClient.getObjectMetadata(bucketName, objectKey);

            Map<String, Object> result = new HashMap<>();
            result.put("contentLength", metadata.getContentLength());
            result.put("contentType", metadata.getContentType());
            result.put("lastModified", metadata.getLastModified());
            result.put("etag", metadata.getETag());
            result.put("userMetadata", metadata.getUserMetadata());
            return result;

        } catch (Exception e) {
            log.error("获取文件元数据失败: {}", fileKey, e);
            return new HashMap<>();
        }
    }

    @Override
    public String getSignedUrl(String fileKey, int expirationSeconds) {
        try {
            String objectKey = extractObjectKey(fileKey);
            Date expiration = new Date(System.currentTimeMillis() + expirationSeconds * 1000L);
            URL url = ossClient.generatePresignedUrl(bucketName, objectKey, expiration);
            return url.toString();
        } catch (Exception e) {
            log.error("生成签名URL失败: {}", fileKey, e);
            return "";
        }
    }

    @Override
    public int deleteBatch(List<String> fileKeys) {
        int successCount = 0;
        for (String fileKey : fileKeys) {
            if (delete(fileKey)) {
                successCount++;
            }
        }
        log.info("批量删除完成: 成功删除 {}/{} 个文件", successCount, fileKeys.size());
        return successCount;
    }

    @Override
    public String getStrategyName() {
        return "ALIYUN_OSS";
    }

    private String generateObjectKey(String fileName) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String extension = "";
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = fileName.substring(dotIndex);
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
        String datePath = sdf.format(new Date());
        return datePath + "/" + uuid + extension;
    }

    private String extractObjectKey(String fileKey) {
        if (fileKey.startsWith(baseUrl)) {
            return fileKey.substring(baseUrl.length() + 1);
        }
        if (fileKey.contains(".aliyuncs.com/")) {
            int idx = fileKey.indexOf(".aliyuncs.com/");
            idx = fileKey.indexOf("/", idx);
            return fileKey.substring(idx + 1);
        }
        return fileKey;
    }

    private String getFileUrl(String objectKey) {
        if (baseUrl != null && !baseUrl.isEmpty()) {
            return baseUrl + "/" + objectKey;
        }
        return "https://" + bucketName + "." + endpoint + "/" + objectKey;
    }
}

package com.shoppro.service.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 本地文件存储实现
 * 支持本地文件系统存储、MD5校验、文件签名URL生成
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Component
public class LocalStorageStrategy implements StorageStrategy {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageStrategy.class);

    @Value("${file.upload.path:/data/shoppro/uploads/}")
    private String uploadPath;

    @Value("${file.upload.url-prefix:/api/files/}")
    private String urlPrefix;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    private static final int BUFFER_SIZE = 8192;
    private static final int SIGNATURE_EXPIRY_SECONDS = 3600; // 1小时

    @Override
    public String upload(String fileName, InputStream inputStream, long fileSize, String contentType) {
        try {
            // 生成文件存储路径
            String fileKey = generateFileKey(fileName);
            Path filePath = getFilePath(fileKey);

            // 创建目录
            Files.createDirectories(filePath.getParent());

            // 保存文件
            long uploadedSize = Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);

            if (uploadedSize != fileSize) {
                log.warn("文件大小不匹配: 期望{}字节，实际{}字节", fileSize, uploadedSize);
            }

            // 生成访问URL
            String fileUrl = urlPrefix + fileKey;
            log.info("文件上传成功: {} -> {}", fileName, fileUrl);

            return fileUrl;

        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public InputStream download(String fileKey) {
        try {
            Path filePath = getFilePath(fileKey);

            if (!Files.exists(filePath)) {
                throw new FileNotFoundException("文件不存在: " + fileKey);
            }

            log.info("开始下载文件: {}", fileKey);
            return Files.newInputStream(filePath, StandardOpenOption.READ);

        } catch (IOException e) {
            log.error("文件下载失败: {}", fileKey, e);
            throw new RuntimeException("文件下载失败: " + e.getMessage());
        }
    }

    @Override
    public boolean delete(String fileKey) {
        try {
            Path filePath = getFilePath(fileKey);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("文件已删除: {}", fileKey);
                return true;
            }

            log.warn("删除的文件不存在: {}", fileKey);
            return false;

        } catch (IOException e) {
            log.error("文件删除失败: {}", fileKey, e);
            return false;
        }
    }

    @Override
    public boolean exists(String fileKey) {
        try {
            Path filePath = getFilePath(fileKey);
            return Files.exists(filePath);
        } catch (Exception e) {
            log.error("检查文件存在失败: {}", fileKey, e);
            return false;
        }
    }

    @Override
    public long getFileSize(String fileKey) {
        try {
            Path filePath = getFilePath(fileKey);

            if (Files.exists(filePath)) {
                return Files.size(filePath);
            }

            return -1;

        } catch (IOException e) {
            log.error("获取文件大小失败: {}", fileKey, e);
            return -1;
        }
    }

    @Override
    public Map<String, Object> getMetadata(String fileKey) {
        try {
            Path filePath = getFilePath(fileKey);

            if (!Files.exists(filePath)) {
                return new HashMap<>();
            }

            BasicFileAttributes attrs = Files.readAttributes(filePath, BasicFileAttributes.class);
            Map<String, Object> metadata = new HashMap<>();

            metadata.put("fileName", filePath.getFileName().toString());
            metadata.put("fileSize", attrs.size());
            metadata.put("createdAt", attrs.creationTime().toInstant());
            metadata.put("modifiedAt", attrs.lastModifiedTime().toInstant());
            metadata.put("md5", calculateFileMD5(filePath));

            return metadata;

        } catch (Exception e) {
            log.error("获取文件元数据失败: {}", fileKey, e);
            return new HashMap<>();
        }
    }

    @Override
    public String getSignedUrl(String fileKey, int expirationSeconds) {
        try {
            // 简单实现：使用时间戳和密钥生成签名
            long expiration = System.currentTimeMillis() + (expirationSeconds * 1000L);
            String signature = generateSignature(fileKey, expiration);

            return urlPrefix + fileKey + "?signature=" + signature + "&expiration=" + expiration;

        } catch (Exception e) {
            log.error("生成签名URL失败: {}", fileKey, e);
            return urlPrefix + fileKey;
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

        return successCount;
    }

    @Override
    public String getStrategyName() {
        return "local";
    }

    private String generateFileKey(String originalFileName) {
        String datePath = DateTimeFormatter.ofPattern("yyyy/MM/dd").format(LocalDateTime.now());
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String extension = "";

        int dotIndex = originalFileName.lastIndexOf('.')
                ;
        if (dotIndex >= 0) {
            extension = originalFileName.substring(dotIndex);
        }

        return datePath + "/" + uuid + extension;
    }

    private Path getFilePath(String fileKey) {
        return Paths.get(uploadPath, fileKey).normalize();
    }

    private String calculateFileMD5(Path filePath) {
        try (InputStream is = Files.newInputStream(filePath)) {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[BUFFER_SIZE];
            int bytesRead;

            while ((bytesRead = is.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }

            StringBuilder sb = new StringBuilder();
            for (byte b : md.digest()) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("计算文件MD5失败", e);
            return "";
        }
    }

    private String generateSignature(String fileKey, long expiration) {
        String secretKey = "shoppro-secret-key"; // 示例密钥，实际生产环境应使用安全存储
        String data = fileKey + "|" + expiration + "|" + secretKey;

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(data.getBytes());

            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString();
        } catch (Exception e) {
            log.error("生成签名失败", e);
            return "";
        }
    }
}

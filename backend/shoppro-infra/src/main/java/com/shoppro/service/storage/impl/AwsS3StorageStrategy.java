package com.shoppro.service.storage.impl;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import com.shoppro.service.storage.StorageStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.InputStream;
import java.net.URI;
import java.time.Duration;
import java.util.*;

@Component
@ConditionalOnProperty(name = "cloud.storage.provider", havingValue = "aws")
public class AwsS3StorageStrategy implements StorageStrategy {

    private static final Logger log = LoggerFactory.getLogger(AwsS3StorageStrategy.class);

    @Value("${cloud.storage.aws.access-key-id:}")
    private String accessKeyId;

    @Value("${cloud.storage.aws.secret-access-key:}")
    private String secretAccessKey;

    @Value("${cloud.storage.aws.region:}")
    private String region;

    @Value("${cloud.storage.aws.bucket-name:}")
    private String bucketName;

    @Value("${cloud.storage.aws.endpoint:}")
    private String endpoint;

    private S3Client s3Client;
    private S3Presigner presigner;

    @PostConstruct
    public void init() {
        log.info("初始化AWS S3客户端: region={}, bucket={}", region, bucketName);

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);

        var builder = S3Client.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(region));

        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        s3Client = builder.build();
        presigner = S3Presigner.builder()
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of(region))
                .endpointOverride(endpoint != null && !endpoint.isEmpty() ? URI.create(endpoint) : null)
                .build();

        log.info("AWS S3客户端初始化成功");
    }

    @PreDestroy
    public void destroy() {
        if (s3Client != null) {
            s3Client.close();
        }
        if (presigner != null) {
            presigner.close();
        }
        log.info("AWS S3客户端已关闭");
    }

    @Override
    public String upload(String fileName, InputStream inputStream, long fileSize, String contentType) {
        try {
            log.info("上传文件到AWS S3: {} ({}字节)", fileName, fileSize);

            String objectKey = generateObjectKey(fileName);

            var metadata = new HashMap<String, String>();
            metadata.put("original-filename", fileName);

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(contentType)
                    .metadata(metadata)
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(inputStream, fileSize));

            String fileUrl = getFileUrl(objectKey);
            log.info("文件上传成功: objectKey={}, url={}", objectKey, fileUrl);
            return fileUrl;

        } catch (Exception e) {
            log.error("AWS S3上传失败: {}", fileName, e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    @Override
    public InputStream download(String fileKey) {
        try {
            log.info("从AWS S3下载文件: {}", fileKey);

            String objectKey = extractObjectKey(fileKey);

            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            return s3Client.getObject(getRequest);

        } catch (Exception e) {
            log.error("AWS S3下载失败: {}", fileKey, e);
            throw new RuntimeException("文件下载失败: " + e.getMessage());
        }
    }

    @Override
    public boolean delete(String fileKey) {
        try {
            log.info("从AWS S3删除文件: {}", fileKey);

            String objectKey = extractObjectKey(fileKey);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("文件删除成功: {}", objectKey);
            return true;

        } catch (Exception e) {
            log.error("AWS S3删除失败: {}", fileKey, e);
            return false;
        }
    }

    @Override
    public boolean exists(String fileKey) {
        try {
            String objectKey = extractObjectKey(fileKey);
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            s3Client.headObject(headRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("检查文件存在失败: {}", fileKey, e);
            return false;
        }
    }

    @Override
    public long getFileSize(String fileKey) {
        try {
            String objectKey = extractObjectKey(fileKey);
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            HeadObjectResponse response = s3Client.headObject(headRequest);
            return response.contentLength();
        } catch (Exception e) {
            log.error("获取文件大小失败: {}", fileKey, e);
            return -1;
        }
    }

    @Override
    public Map<String, Object> getMetadata(String fileKey) {
        try {
            String objectKey = extractObjectKey(fileKey);
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .build();
            HeadObjectResponse response = s3Client.headObject(headRequest);

            Map<String, Object> result = new HashMap<>();
            result.put("contentLength", response.contentLength());
            result.put("contentType", response.contentType());
            result.put("lastModified", response.lastModified());
            result.put("etag", response.eTag());
            result.put("metadata", response.metadata());
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

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofSeconds(expirationSeconds))
                    .getObjectRequest(r -> r.bucket(bucketName).key(objectKey))
                    .build();

            return presigner.presignGetObject(presignRequest).url().toString();
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
        return "AWS_S3";
    }

    private String generateObjectKey(String fileName) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String extension = "";
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = fileName.substring(dotIndex);
        }
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy/MM/dd");
        String datePath = sdf.format(new Date());
        return datePath + "/" + uuid + extension;
    }

    private String extractObjectKey(String fileKey) {
        if (fileKey.startsWith("s3://")) {
            return fileKey.substring(5 + bucketName.length() + 1);
        }
        if (fileKey.contains(".s3.") || fileKey.contains(".amazonaws.com/")) {
            int idx = fileKey.indexOf(".amazonaws.com/");
            if (idx > 0) {
                return fileKey.substring(idx + 14);
            }
        }
        return fileKey;
    }

    private String getFileUrl(String objectKey) {
        if (endpoint != null && !endpoint.isEmpty()) {
            return endpoint + "/" + bucketName + "/" + objectKey;
        }
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + objectKey;
    }
}

package com.shoppro.service.impl;

import com.shoppro.config.FileUploadConfig;
import com.shoppro.entity.FileUpload;
import com.shoppro.repository.FileUploadRepository;
import com.shoppro.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.IOException;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 文件存储服务实现
 * 支持本地文件系统存储，可扩展为云存储
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
@Transactional
public class FileStorageServiceImpl implements FileStorageService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(FileStorageServiceImpl.class);

    private final FileUploadRepository fileUploadRepository;
    private final FileUploadConfig fileUploadConfig;

    public FileStorageServiceImpl(FileUploadRepository fileUploadRepository, FileUploadConfig fileUploadConfig) {
        this.fileUploadRepository = fileUploadRepository;
        this.fileUploadConfig = fileUploadConfig;
    }

    private static final int BUFFER_SIZE = 1024 * 1024; // 1MB

    /**
     * 上传单个文件
     */
    @Override
    public FileUpload uploadFile(MultipartFile file, String relatedEntityType, Long relatedEntityId,
                                 Long uploadedBy, String uploadedByName) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        // 验证文件
        if (!isFileAllowed(file.getOriginalFilename(), file.getSize())) {
            throw new IllegalArgumentException("不支持的文件类型或文件过大");
        }

        try {
            // 计算MD5哈希值检测重复
            String md5Hash = calculateMD5(file);
            FileUpload existingFile = fileUploadRepository.findByMd5Hash(md5Hash);
            if (existingFile != null && existingFile.getStatus() == 1) {
                logger.info("文件已存在，使用已上传文件: {}", existingFile.getFileUrl());
                return existingFile;
            }

            // 生成保存路径和文件名
            String savedFileName = generateSavedFileName(file.getOriginalFilename());
            Path uploadDir = Paths.get(fileUploadConfig.getPath());
            Files.createDirectories(uploadDir);

            Path filePath = uploadDir.resolve(savedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 构建文件URL
            String fileUrl = buildFileUrl(savedFileName);

            // 创建文件记录
            FileUpload fileUpload = new FileUpload();
            fileUpload.setOriginalFileName(file.getOriginalFilename());
            fileUpload.setSavedFileName(savedFileName);
            fileUpload.setFileUrl(fileUrl);
            fileUpload.setFileSize(file.getSize());
            fileUpload.setMimeType(file.getContentType());
            fileUpload.setFileExtension(getFileExtension(file.getOriginalFilename()));
            fileUpload.setRelatedEntityType(relatedEntityType);
            fileUpload.setRelatedEntityId(relatedEntityId);
            fileUpload.setUploadedBy(uploadedBy);
            fileUpload.setUploadedByName(uploadedByName);
            fileUpload.setStatus(1);
            fileUpload.setMd5Hash(md5Hash);
            fileUpload.setDownloadCount(0);
            fileUpload.setCreatedAt(LocalDateTime.now());

            fileUploadRepository.insert(fileUpload);
            logger.info("文件上传成功: {}", fileUrl);

            return fileUpload;

        } catch (Exception e) {
            logger.error("文件上传失败: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 批量上传文件
     */
    @Override
    public List<FileUpload> uploadFiles(List<MultipartFile> files, String relatedEntityType,
                                        Long relatedEntityId, Long uploadedBy, String uploadedByName) {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        return files.stream()
                .map(file -> uploadFile(file, relatedEntityType, relatedEntityId, uploadedBy, uploadedByName))
                .collect(Collectors.toList());
    }

    /**
     * 删除文件
     */
    @Override
    public boolean deleteFile(Long fileId) {
        if (fileId == null || fileId <= 0) {
            return false;
        }

        try {
            FileUpload fileUpload = fileUploadRepository.selectById(fileId);
            if (fileUpload == null) {
                return false;
            }

            // 物理删除文件
            Path filePath = Paths.get(fileUploadConfig.getPath()).resolve(fileUpload.getSavedFileName());
            Files.deleteIfExists(filePath);

            // 逻辑删除数据库记录
            fileUpload.setStatus(0);
            fileUploadRepository.updateById(fileUpload);

            logger.info("文件已删除: {}", fileUpload.getFileUrl());
            return true;

        } catch (Exception e) {
            logger.error("文件删除失败: {}", fileId, e);
            return false;
        }
    }

    /**
     * 批量删除文件
     */
    @Override
    public boolean deleteFiles(List<Long> fileIds) {
        if (fileIds == null || fileIds.isEmpty()) {
            return false;
        }

        return fileIds.stream()
                .allMatch(this::deleteFile);
    }

    /**
     * 获取文件信息
     */
    @Override
    public FileUpload getFileInfo(Long fileId) {
        if (fileId == null || fileId <= 0) {
            return null;
        }
        return fileUploadRepository.selectById(fileId);
    }

    /**
     * 获取相关实体的所有文件
     */
    @Override
    public List<FileUpload> getFilesByEntity(String relatedEntityType, Long relatedEntityId) {
        if (relatedEntityType == null || relatedEntityId == null || relatedEntityId <= 0) {
            return new ArrayList<>();
        }
        return fileUploadRepository.findByRelatedEntity(relatedEntityType, relatedEntityId);
    }

    /**
     * 下载文件
     */
    @Override
    public byte[] downloadFile(Long fileId) {
        FileUpload fileUpload = getFileInfo(fileId);
        if (fileUpload == null || fileUpload.getStatus() == 0) {
            return null;
        }

        try {
            Path filePath = Paths.get(fileUploadConfig.getPath()).resolve(fileUpload.getSavedFileName());
            byte[] fileContent = Files.readAllBytes(filePath);

            // 增加下载次数
            incrementDownloadCount(fileId);

            logger.info("文件已下载: {}", fileUpload.getFileUrl());
            return fileContent;

        } catch (IOException e) {
            logger.error("文件下载失败: {}", fileId, e);
            return null;
        }
    }

    /**
     * 验证文件是否允许上传
     */
    @Override
    public boolean isFileAllowed(String fileName, long fileSize) {
        if (fileName == null || fileName.isEmpty()) {
            return false;
        }

        // 检查文件大小
        if (!fileUploadConfig.isFileSizeValid(fileSize)) {
            logger.warn("文件过大: {} bytes, 最大允许: {} bytes", fileSize, fileUploadConfig.getMaxSize());
            return false;
        }

        // 检查文件类型
        String extension = getFileExtension(fileName);
        if (!fileUploadConfig.isFileTypeAllowed(extension)) {
            logger.warn("不支持的文件类型: {}", extension);
            return false;
        }

        return true;
    }

    /**
     * 获取文件访问URL
     */
    @Override
    public String getFileUrl(Long fileId) {
        FileUpload fileUpload = getFileInfo(fileId);
        if (fileUpload == null) {
            return null;
        }
        return fileUpload.getFileUrl();
    }

    /**
     * 增加文件下载次数
     */
    @Override
    public void incrementDownloadCount(Long fileId) {
        if (fileId == null || fileId <= 0) {
            return;
        }

        FileUpload fileUpload = getFileInfo(fileId);
        if (fileUpload != null) {
            fileUpload.setDownloadCount((fileUpload.getDownloadCount() == null ? 0 : fileUpload.getDownloadCount()) + 1);
            fileUploadRepository.updateById(fileUpload);
        }
    }

    /**
     * 生成保存的文件名
     */
    private String generateSavedFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        String timestamp = System.currentTimeMillis() + "";
        String randomStr = UUID.randomUUID().toString().substring(0, 8);
        return timestamp + "_" + randomStr + (extension.isEmpty() ? "" : "." + extension);
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 构建文件访问URL
     */
    private String buildFileUrl(String savedFileName) {
        return fileUploadConfig.getUrlPrefix() + savedFileName;
    }

    /**
     * 计算文件MD5哈希值
     */
    private String calculateMD5(MultipartFile file) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] buffer = new byte[BUFFER_SIZE];
        int bytesRead;

        try (InputStream is = file.getInputStream()) {
            while ((bytesRead = is.read(buffer)) != -1) {
                md.update(buffer, 0, bytesRead);
            }
        }

        byte[] digest = md.digest();
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }

        return sb.toString();
    }
}
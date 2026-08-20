package com.shoppro.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 文件上传记录实体
 * 用于记录所有上传的文件及其元数据，支持审计追踪
 *
 * @author ShopPro Team
 * @version 1.0.0
 */

@TableName("file_uploads")
public class FileUpload {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 原始文件名
     */
    private String originalFileName;

    /**
     * 保存文件名（含路径）
     */
    private String savedFileName;

    /**
     * 文件访问URL
     */
    private String fileUrl;

    /**
     * 文件大小（字节）
     */
    private Long fileSize;

    /**
     * 文件类型/MIME type
     */
    private String mimeType;

    /**
     * 文件扩展名
     */
    private String fileExtension;

    /**
     * 相关实体类型（如knowledge, customer等）
     */
    private String relatedEntityType;

    /**
     * 相关实体ID
     */
    private Long relatedEntityId;

    /**
     * 上传人ID
     */
    private Long uploadedBy;

    /**
     * 上传人用户名
     */
    private String uploadedByName;

    /**
     * 文件状态：1-有效，0-已删除
     */
    private Integer status;

    /**
     * 文件MD5哈希值（用于重复检测）
     */
    private String md5Hash;

    /**
     * 下载次数
     */
    private Integer downloadCount;

    /**
     * 备注/描述
     */
    private String remarks;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

        public FileUpload() {}

        public FileUpload(Long id, String originalFileName, String savedFileName, String fileUrl, Long fileSize,
                      String mimeType, String fileExtension, String relatedEntityType, Long relatedEntityId,
                      Long uploadedBy, String uploadedByName, Integer status, String md5Hash, Integer downloadCount,
                      String remarks, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.originalFileName = originalFileName;
        this.savedFileName = savedFileName;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.fileExtension = fileExtension;
        this.relatedEntityType = relatedEntityType;
        this.relatedEntityId = relatedEntityId;
        this.uploadedBy = uploadedBy;
        this.uploadedByName = uploadedByName;
        this.status = status;
        this.md5Hash = md5Hash;
        this.downloadCount = downloadCount;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

        public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getSavedFileName() { return savedFileName; }
    public void setSavedFileName(String savedFileName) { this.savedFileName = savedFileName; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getFileExtension() { return fileExtension; }
    public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public Long getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public String getMd5Hash() { return md5Hash; }
    public void setMd5Hash(String md5Hash) { this.md5Hash = md5Hash; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
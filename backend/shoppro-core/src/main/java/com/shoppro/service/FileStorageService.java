package com.shoppro.service;

import com.shoppro.entity.FileUpload;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

/**
 * 文件存储业务服务接口
 * 支持本地文件系统和云存储（可扩展）
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface FileStorageService {

    /**
     * 上传文件
     * @param file 上传的文件
     * @param relatedEntityType 关联实体类型
     * @param relatedEntityId 关联实体ID
     * @param uploadedBy 上传人ID
     * @param uploadedByName 上传人名称
     * @return 文件上传记录
     */
    FileUpload uploadFile(MultipartFile file, String relatedEntityType, Long relatedEntityId,
                          Long uploadedBy, String uploadedByName);

    /**
     * 批量上传文件
     * @param files 上传的文件列表
     * @param relatedEntityType 关联实体类型
     * @param relatedEntityId 关联实体ID
     * @param uploadedBy 上传人ID
     * @param uploadedByName 上传人名称
     * @return 文件上传记录列表
     */
    List<FileUpload> uploadFiles(List<MultipartFile> files, String relatedEntityType,
                                 Long relatedEntityId, Long uploadedBy, String uploadedByName);

    /**
     * 删除文件
     * @param fileId 文件ID
     * @return 是否成功
     */
    boolean deleteFile(Long fileId);

    /**
     * 批量删除文件
     * @param fileIds 文件ID列表
     * @return 是否成功
     */
    boolean deleteFiles(List<Long> fileIds);

    /**
     * 获取文件信息
     * @param fileId 文件ID
     * @return 文件对象
     */
    FileUpload getFileInfo(Long fileId);

    /**
     * 获取相关实体的所有文件
     * @param relatedEntityType 实体类型
     * @param relatedEntityId 实体ID
     * @return 文件列表
     */
    List<FileUpload> getFilesByEntity(String relatedEntityType, Long relatedEntityId);

    /**
     * 下载文件
     * @param fileId 文件ID
     * @return 文件字节数组
     */
    byte[] downloadFile(Long fileId);

    /**
     * 验证文件是否允许上传
     * @param fileName 文件名
     * @param fileSize 文件大小
     * @return 是否允许
     */
    boolean isFileAllowed(String fileName, long fileSize);

    /**
     * 获取文件访问URL
     * @param fileId 文件ID
     * @return 文件URL
     */
    String getFileUrl(Long fileId);

    /**
     * 增加文件下载次数
     * @param fileId 文件ID
     */
    void incrementDownloadCount(Long fileId);
}
package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.FileUpload;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 文件上传记录Repository
 * 基于MyBatis-Plus的数据访问层
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Mapper
public interface FileUploadRepository extends BaseMapper<FileUpload> {

    /**
     * 查询相关实体的所有文件
     * @param relatedEntityType 实体类型
     * @param relatedEntityId 实体ID
     * @return 文件列表
     */
    List<FileUpload> findByRelatedEntity(@Param("relatedEntityType") String relatedEntityType,
                                         @Param("relatedEntityId") Long relatedEntityId);

    /**
     * 根据MD5哈希值查询文件（用于去重）
     * @param md5Hash MD5哈希值
     * @return 文件对象
     */
    FileUpload findByMd5Hash(@Param("md5Hash") String md5Hash);

    /**
     * 查询指定用户上传的文件
     * @param uploadedBy 上传人ID
     * @return 文件列表
     */
    List<FileUpload> findByUploader(@Param("uploadedBy") Long uploadedBy);

    /**
     * 统计指定实体的文件数量
     * @param relatedEntityType 实体类型
     * @param relatedEntityId 实体ID
     * @return 文件数量
     */
    long countByRelatedEntity(@Param("relatedEntityType") String relatedEntityType,
                              @Param("relatedEntityId") Long relatedEntityId);
}
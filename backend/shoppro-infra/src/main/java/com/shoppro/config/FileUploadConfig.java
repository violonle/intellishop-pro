package com.shoppro.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import java.util.Arrays;
import java.util.List;

/**
 * 文件上传配置
 * 从application.yml读取配置
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Configuration
@ConfigurationProperties(prefix = "file.upload")
public class FileUploadConfig {

    /**
     * 文件上传保存路径
     */
    private String path = "/data/shoppro/uploads/";

    /**
     * 文件访问URL前缀
     */
    private String urlPrefix = "/api/files/";

    /**
     * 允许的文件类型
     */
    private String allowedTypes = "jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt";

    /**
     * 最大文件大小（字节），默认10MB
     */
    private long maxSize = 10485760;

    // 显式无参构造器
    public FileUploadConfig() {}

    /**
     * 文件类型列表
     */
    public List<String> getAllowedTypesList() {
        return Arrays.asList(allowedTypes.split(","));
    }

    /**
     * 检查文件大小是否超过限制
     */
    public boolean isFileSizeValid(long fileSize) {
        return fileSize <= maxSize;
    }

    /**
     * 检查文件类型是否被允许
     */
    public boolean isFileTypeAllowed(String fileExtension) {
        if (fileExtension == null || fileExtension.isEmpty()) {
            return false;
        }
        String ext = fileExtension.toLowerCase().replaceAll("^\\.", "");
        return getAllowedTypesList().contains(ext);
    }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getUrlPrefix() { return urlPrefix; }
    public void setUrlPrefix(String urlPrefix) { this.urlPrefix = urlPrefix; }

    public String getAllowedTypes() { return allowedTypes; }
    public void setAllowedTypes(String allowedTypes) { this.allowedTypes = allowedTypes; }

    public long getMaxSize() { return maxSize; }
    public void setMaxSize(long maxSize) { this.maxSize = maxSize; }
}

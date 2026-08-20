package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.FileUpload;
import com.shoppro.service.FileStorageService;
import com.shoppro.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 文件上传管理控制器
 * 提供文件的上传、下载、删除等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/files")
@Tag(name = "文件管理", description = "文件上传、下载、删除等操作")
public class FileUploadController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FileUploadController.class);

    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    public FileUploadController(FileStorageService fileStorageService, UserRepository userRepository) {
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
    }

    /**
     * 单个文件上传
     */
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "上传单个文件")

    public ApiResponse<FileUpload> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "relatedEntityType", required = false) String relatedEntityType,
            @RequestParam(value = "relatedEntityId", required = false) Long relatedEntityId) {

        try {
            Long userId = getCurrentUserId();
            String userName = getCurrentUserName();

            FileUpload uploadedFile = fileStorageService.uploadFile(
                    file,
                    relatedEntityType != null ? relatedEntityType : "general",
                    relatedEntityId != null ? relatedEntityId : 0L,
                    userId,
                    userName
            );

            return ApiResponse.success(uploadedFile, "文件上传成功");

        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return ApiResponse.error(500, "文件上传失败: " + e.getMessage());
        }
    }

    /**
     * 批量文件上传
     */
    @PostMapping("/upload-batch")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "批量上传文件")

    public ApiResponse<List<FileUpload>> uploadFileBatch(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "relatedEntityType", required = false) String relatedEntityType,
            @RequestParam(value = "relatedEntityId", required = false) Long relatedEntityId) {

        try {
            Long userId = getCurrentUserId();
            String userName = getCurrentUserName();

            List<FileUpload> uploadedFiles = fileStorageService.uploadFiles(
                    files,
                    relatedEntityType != null ? relatedEntityType : "general",
                    relatedEntityId != null ? relatedEntityId : 0L,
                    userId,
                    userName
            );

            return ApiResponse.success(uploadedFiles, "批量上传成功，共" + uploadedFiles.size() + "个文件");

        } catch (IllegalArgumentException e) {
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("批量文件上传失败", e);
            return ApiResponse.error(500, "批量上传失败: " + e.getMessage());
        }
    }

    /**
     * 下载文件
     */
    @GetMapping("/download/{fileId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "下载文件")
    
    public ResponseEntity<?> downloadFile(@PathVariable Long fileId) {
        try {
            FileUpload fileUpload = fileStorageService.getFileInfo(fileId);
            if (fileUpload == null || fileUpload.getStatus() == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("文件不存在");
            }
            assertFileAccess(fileUpload);

            byte[] fileContent = fileStorageService.downloadFile(fileId);
            if (fileContent == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("无法读取文件");
            }

            String encodedFileName = URLEncoder.encode(
                    fileUpload.getOriginalFileName(),
                    StandardCharsets.UTF_8.toString()
            );

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + encodedFileName + "\"")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                    .body(fileContent);

        } catch (Exception e) {
            log.error("文件下载失败: {}", fileId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("文件下载失败");
        }
    }

    /**
     * 删除单个文件
     */
    @DeleteMapping("/{fileId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "删除文件")
    
    public ApiResponse<Void> deleteFile(@PathVariable Long fileId) {
        try {
            FileUpload file = fileStorageService.getFileInfo(fileId);
            if (file == null) return ApiResponse.error(404, "文件不存在");
            assertFileAccess(file);
            boolean result = fileStorageService.deleteFile(fileId);
            if (result) {
                return ApiResponse.success(null, "文件删除成功");
            } else {
                return ApiResponse.error(404, "文件不存在或删除失败");
            }
        } catch (Exception e) {
            log.error("文件删除失败: {}", fileId, e);
            return ApiResponse.error(500, "文件删除失败: " + e.getMessage());
        }
    }

    /**
     * 批量删除文件
     */
    @DeleteMapping("/batch-delete")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "批量删除文件")
    
    public ApiResponse<Void> deleteFiles(@RequestParam List<Long> fileIds) {
        try {
            for (Long fileId : fileIds) {
                FileUpload file = fileStorageService.getFileInfo(fileId);
                if (file == null) throw new IllegalArgumentException("文件不存在: " + fileId);
                assertFileAccess(file);
            }
            boolean result = fileStorageService.deleteFiles(fileIds);
            if (result) {
                return ApiResponse.success(null, "批量删除成功");
            } else {
                return ApiResponse.error(500, "删除失败");
            }
        } catch (Exception e) {
            log.error("批量删除文件失败", e);
            return ApiResponse.error(500, "批量删除失败: " + e.getMessage());
        }
    }

    /**
     * 获取文件信息
     */
    @GetMapping("/{fileId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "获取文件信息")
    
    public ApiResponse<FileUpload> getFileInfo(@PathVariable Long fileId) {
        try {
            FileUpload fileUpload = fileStorageService.getFileInfo(fileId);
            if (fileUpload == null) {
                return ApiResponse.error(404, "文件不存在");
            }
            assertFileAccess(fileUpload);
            return ApiResponse.success(fileUpload, "获取成功");
        } catch (Exception e) {
            log.error("获取文件信息失败: {}", fileId, e);
            return ApiResponse.error(500, "获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取相关实体的所有文件
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "获取实体相关的所有文件")

    public ApiResponse<List<FileUpload>> getFilesByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        try {
            List<FileUpload> files = fileStorageService.getFilesByEntity(entityType, entityId).stream()
                    .filter(this::hasFileAccess)
                    .toList();
            return ApiResponse.success(files, "查询成功");
        } catch (Exception e) {
            log.error("获取实体文件列表失败: {} {}", entityType, entityId, e);
            return ApiResponse.error(500, "查询失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                com.shoppro.entity.User user = userRepository.selectByUsername(auth.getName());
                return user == null ? null : user.getId();
            }
        } catch (Exception e) {
            log.debug("无法获取当前用户ID", e);
        }
        throw new IllegalStateException("当前请求未认证");
    }

    /**
     * 获取当前用户名
     */
    private String getCurrentUserName() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.debug("无法获取当前用户名", e);
        }
        throw new IllegalStateException("当前请求未认证");
    }

    private void assertFileAccess(FileUpload file) {
        if (!hasFileAccess(file)) throw new SecurityException("无权访问该文件");
    }

    private boolean hasFileAccess(FileUpload file) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        boolean admin = auth.getAuthorities().stream().anyMatch(a ->
                List.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_PLATFORM_ADMIN").contains(a.getAuthority()));
        if (admin) return true;
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(file.getUploadedBy());
    }
}

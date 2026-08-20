package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.service.integration.WeCom;
import com.shoppro.service.integration.WeComService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;

/**
 * 企业微信集成控制器
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/wecom")
@Tag(name = "企业微信集成", description = "企业微信消息、用户、部门管理")
@ConditionalOnBean(WeComService.class)
public class WeComController {

    private static final Logger log = LoggerFactory.getLogger(WeComController.class);

    private final WeComService weComService;

    public WeComController(WeComService weComService) {
        this.weComService = weComService;
    }

    @PostMapping("/send/text")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "发送文本消息")
    public ApiResponse<WeCom.MessageSendResult> sendTextMessage(
            @RequestParam(required = false) String toUser,
            @RequestParam(required = false) String toParty,
            @RequestParam(required = false) String toTag,
            @RequestParam String content) {
        
        try {
            if ((toUser == null || toUser.isEmpty()) &&
                (toParty == null || toParty.isEmpty()) &&
                (toTag == null || toTag.isEmpty())) {
                return ApiResponse.error("必须指定收件人（toUser、toParty或toTag）", 400);
            }
            
            WeCom.MessageSendResult result = weComService.sendTextMessage(toUser, toParty, toTag, content);
            if (result != null && result.getErrcode() == 0) {
                return ApiResponse.success(result, "消息发送成功");
            } else {
                return ApiResponse.error("消息发送失败", 500);
            }
        } catch (Exception e) {
            log.error("发送文本消息异常", e);
            return ApiResponse.error("发送失败: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/send/news")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "发送图文消息")
    public ApiResponse<WeCom.MessageSendResult> sendNewsMessage(
            @RequestParam(required = false) String toUser,
            @RequestParam(required = false) String toParty,
            @RequestParam(required = false) String toTag,
            @RequestBody List<WeCom.Article> articles) {
        
        try {
            if ((toUser == null || toUser.isEmpty()) &&
                (toParty == null || toParty.isEmpty()) &&
                (toTag == null || toTag.isEmpty())) {
                return ApiResponse.error("必须指定收件人", 400);
            }
            
            WeCom.MessageSendResult result = weComService.sendNewsMessage(toUser, toParty, toTag, articles);
            if (result != null && result.getErrcode() == 0) {
                return ApiResponse.success(result, "消息发送成功");
            } else {
                return ApiResponse.error("消息发送失败", 500);
            }
        } catch (Exception e) {
            log.error("发送图文消息异常", e);
            return ApiResponse.error("发送失败: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/send/image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "发送图片消息")
    public ApiResponse<WeCom.MessageSendResult> sendImageMessage(
            @RequestParam(required = false) String toUser,
            @RequestParam(required = false) String toParty,
            @RequestParam(required = false) String toTag,
            @RequestParam String mediaId) {
        
        try {
            WeCom.MessageSendResult result = weComService.sendImageMessage(toUser, toParty, toTag, mediaId);
            if (result != null && result.getErrcode() == 0) {
                return ApiResponse.success(result, "消息发送成功");
            } else {
                return ApiResponse.error("消息发送失败", 500);
            }
        } catch (Exception e) {
            log.error("发送图片消息异常", e);
            return ApiResponse.error("发送失败: " + e.getMessage(), 500);
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "获取用户信息")
    public ApiResponse<WeCom.UserInfo> getUserInfo(@PathVariable String userId) {
        try {
            WeCom.UserInfo userInfo = weComService.getUserInfo(userId);
            if (userInfo != null) {
                return ApiResponse.success(userInfo, "获取成功");
            } else {
                return ApiResponse.error("用户不存在", 404);
            }
        } catch (Exception e) {
            log.error("获取用户信息异常", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    @GetMapping("/department/{departmentId}/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "获取部门所有成员")
    public ApiResponse<List<WeCom.UserInfo>> listDepartmentUsers(@PathVariable Integer departmentId) {
        try {
            List<WeCom.UserInfo> users = weComService.listDepartmentUsers(departmentId);
            return ApiResponse.success(users, "获取成功");
        } catch (Exception e) {
            log.error("获取部门成员异常", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    @GetMapping("/departments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    @Operation(summary = "获取所有部门")
    public ApiResponse<List<WeCom.DepartmentInfo>> listDepartments(
            @RequestParam(required = false) Integer parentId) {
        try {
            List<WeCom.DepartmentInfo> departments = weComService.listDepartments(parentId);
            return ApiResponse.success(departments, "获取成功");
        } catch (Exception e) {
            log.error("获取部门异常", e);
            return ApiResponse.error("获取失败: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/sync/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "同步所有用户")
    public ApiResponse<Integer> syncAllUsers() {
        try {
            int syncCount = weComService.syncAllUsers();
            return ApiResponse.success(syncCount, "同步完成，共" + syncCount + "个用户");
        } catch (Exception e) {
            log.error("同步用户异常", e);
            return ApiResponse.error("同步失败: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/sync/departments")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "同步所有部门")
    public ApiResponse<Integer> syncAllDepartments() {
        try {
            int syncCount = weComService.syncAllDepartments();
            return ApiResponse.success(syncCount, "同步完成，共" + syncCount + "个部门");
        } catch (Exception e) {
            log.error("同步部门异常", e);
            return ApiResponse.error("同步失败: " + e.getMessage(), 500);
        }
    }

    @PostMapping("/callback")
    @Operation(summary = "企业微信消息回调")
    public String handleCallback(
            @RequestParam("msg_signature") String msgSignature,
            @RequestParam String timestamp,
            @RequestParam String nonce,
            @RequestParam(required = false) String echostr,
            @RequestBody(required = false) String xml) {
        
        return weComService.handleMessageCallback(timestamp, nonce, msgSignature, echostr, xml);
    }

    @GetMapping("/health")
    @Operation(summary = "企业微信集成健康检查")
    public ApiResponse<String> health() {
        try {
            String token = weComService.getAccessToken();
            if (token != null && !token.isEmpty()) {
                return ApiResponse.success("healthy", "企业微信集成正常");
            } else {
                return ApiResponse.error("无法获取企业微信Token", 500);
            }
        } catch (Exception e) {
            log.error("健康检查异常", e);
            return ApiResponse.error("企业微信集成异常", 500);
        }
    }
}

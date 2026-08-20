package com.shoppro.service.integration;

import java.util.List;

/**
 * 企业微信集成服务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface WeComService {

    /**
     * 获取企业微信访问Token
     */
    String getAccessToken();

    /**
     * 发送文本消息
     */
    WeCom.MessageSendResult sendTextMessage(String toUser, String toParty, String toTag, String content);

    /**
     * 发送图文消息
     */
    WeCom.MessageSendResult sendNewsMessage(String toUser, String toParty, String toTag, 
                                           List<WeCom.Article> articles);

    /**
     * 发送图片消息
     */
    WeCom.MessageSendResult sendImageMessage(String toUser, String toParty, String toTag, String mediaId);

    /**
     * 获取用户信息
     */
    WeCom.UserInfo getUserInfo(String userId);

    /**
     * 获取部门所有成员
     */
    List<WeCom.UserInfo> listDepartmentUsers(Integer departmentId);

    /**
     * 获取所有部门
     */
    List<WeCom.DepartmentInfo> listDepartments(Integer parentId);

    /**
     * 同步所有用户到系统
     */
    int syncAllUsers();

    /**
     * 同步所有部门到系统
     */
    int syncAllDepartments();

    /**
     * 接收消息回调处理
     */
    String handleMessageCallback(String timestamp, String nonce, String signature, String echostr, String xml);

    /**
     * 验证消息签名
     */
    boolean validateMessageSignature(String timestamp, String nonce, String signature);

    /**
     * 设置消息回调函数
     */
    boolean setupCallbackUrl(String url);
}

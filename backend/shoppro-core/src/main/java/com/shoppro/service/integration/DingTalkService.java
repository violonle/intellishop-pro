package com.shoppro.service.integration;

import java.util.List;

/**
 * 钉钉集成服务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface DingTalkService {

    /**
     * 获取钉钉访问Token
     */
    String getAccessToken();

    /**
     * 发送文本消息
     */
    DingTalk.MessageSendResult sendTextMessage(Long receiverId, String content);

    /**
     * 通过机器人发送消息
     */
    DingTalk.RobotMessageResult sendRobotMessage(String robotHookUrl, String content);

    /**
     * 发送Markdown消息
     */
    DingTalk.MessageSendResult sendMarkdownMessage(Long receiverId, String title, String content);

    /**
     * 获取用户信息
     */
    DingTalk.UserInfo getUserInfo(Long userId);

    /**
     * 获取部门信息
     */
    DingTalk.DepartmentInfo getDepartmentInfo(Integer departmentId);

    /**
     * 获取部门所有成员
     */
    List<DingTalk.UserInfo> listDepartmentUsers(Integer departmentId);

    /**
     * 获取所有部门
     */
    List<DingTalk.DepartmentInfo> listDepartments();

    /**
     * 同步所有用户
     */
    int syncAllUsers();

    /**
     * 同步所有部门
     */
    int syncAllDepartments();

    /**
     * 获取审批流程列表
     */
    List<DingTalk.WorkflowInfo> listWorkflows();

    /**
     * 获取用户的待办任务
     */
    List<DingTalk.TaskInfo> getUserTasks(Long userId);

    /**
     * 处理机器人回调
     */
    String handleRobotCallback(String content);

    /**
     * 健康检查
     */
    boolean healthCheck();
}

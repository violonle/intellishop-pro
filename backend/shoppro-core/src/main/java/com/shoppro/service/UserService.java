package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.User;
import com.shoppro.dto.UserLoginRequest;
import com.shoppro.dto.UserRegisterRequest;

import java.util.List;

/**
 * 用户业务接口
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface UserService extends IService<User> {

    /**
     * 用户注册
     */
    User register(UserRegisterRequest request);

    /**
     * 用户登录
     */
    String login(UserLoginRequest request);

    /**
     * 刷新令牌
     */
    String refreshToken(String refreshToken);

    /**
     * 获取当前登录用户
     */
    User getCurrentUser(String token);

    /**
     * 分页查询用户列表
     */
    Page<User> listUsers(int pageNo, int pageSize, String keyword, Integer roleFilter, Boolean isAdminOnly,
            Long enterpriseId, String sortBy, String sortOrder);

    /**
     * 创建用户
     */
    User createUser(User user);

    /**
     * 获取用户详情
     */
    User getUserDetail(Long userId);

    /**
     * 修改用户信息
     */
    boolean updateUserInfo(Long userId, User userInfo);

    /**
     * 修改密码
     */
    boolean changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 重置密码
     */
    boolean resetPassword(Long userId, String newPassword);

    /**
     * 启用/禁用用户
     */
    boolean toggleUserStatus(Long userId);

    /**
     * 检查用户名是否存在
     */
    boolean checkUsernameExists(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean checkEmailExists(String email);

    /**
     * 批量导入用户
     */
    int bulkImportUsers(String csvContent);

    /**
     * 根据企业ID获取用户列表
     */
    List<User> getUsersByEnterpriseId(Long enterpriseId);

    /**
     * 根据用户名获取用户
     */
    User getByUsername(String username);

    /**
     * 删除用户
     */
    void deleteUser(Long userId);
}

package com.shoppro.service.impl;

import com.shoppro.dto.request.LoginRequest;
import com.shoppro.dto.request.RegisterRequest;
import com.shoppro.dto.response.LoginResponse;
import com.shoppro.entity.User;
import com.shoppro.entity.UserProfile;
import com.shoppro.repository.UserRepository;
import com.shoppro.repository.UserProfileRepository;
import com.shoppro.security.JwtTokenProvider;
import com.shoppro.service.AuthService;
import com.shoppro.service.sms.SmsService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * 认证业务实现类
 * 实现用户认证相关的业务逻辑
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
// @Slf4j
@Service
// @RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final SmsService smsService;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${sms.verification.code-length:6}")
    private int codeLength;

    public AuthServiceImpl(UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            JwtTokenProvider jwtTokenProvider,
            PasswordEncoder passwordEncoder,
            StringRedisTemplate redisTemplate,
            SmsService smsService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.redisTemplate = redisTemplate;
        this.smsService = smsService;
    }

    /**
     * 用户登录
     */
    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) throws Exception {
        log.info("用户登录: {}", request.getUsername());

        // 查询用户（支持用户名、手机号、邮箱登录）
        User user = findUserByCredential(request.getUsername());
        if (user == null) {
            log.warn("用户不存在: {}", request.getUsername());
            throw new Exception("用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() == 0) {
            log.warn("用户已禁用: {}", user.getId());
            throw new Exception("用户已禁用，请联系管理员");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("密码错误: {}", user.getId());
            throw new Exception("用户名或密码错误");
        }

        String sysCode = request.getSysCode() == null ? "" : request.getSysCode().trim().toUpperCase();
        String role = user.getRole() == null ? "user" : user.getRole().trim().toLowerCase();
        boolean platformRole = switch (role) {
            case "super_admin", "admin", "platform_admin", "enterprise_admin" -> true;
            default -> false;
        };
        if (platformRole && !"PC".equals(sysCode)) {
            throw new Exception("当前账号只能从管理后台登录");
        }
        if (!platformRole && !"APP".equals(sysCode) && !"PC".equals(sysCode)) {
            throw new Exception("登录入口无效");
        }

        log.info("用户认证通过: userId={}, username={}, role={}, sysCode={}", user.getId(), user.getUsername(), role, sysCode);

        userRepository.updateLastLoginTime(user.getId());

        // 生成token
        String accessToken = jwtTokenProvider.generateTokenFromUsername(user.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());

        // 缓存刷新令牌（Redis不可用时跳过）
        try {
            cacheRefreshToken(user.getUsername(), refreshToken);
        } catch (Exception e) {
            log.warn("Redis缓存失败，跳过缓存刷新令牌: {}", e.getMessage());
        }

        log.info("用户登录成功: {}", user.getId());
        return buildLoginResponse(user, accessToken, refreshToken);
    }

    /**
     * 用户注册
     */
    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) throws Exception {
        log.info("用户注册: {}", request.getPhone());

        // 验证两次密码是否一致
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new Exception("两次输入的密码不一致");
        }

        // 检查用户名是否存在 - 使用 UserProfileRepository
        if (userProfileRepository.countByUsername(request.getUsername()) > 0) {
            throw new Exception("用户名已存在");
        }

        // 检查手机号是否存在
        if (userProfileRepository.countByPhone(request.getPhone()) > 0) {
            throw new Exception("手机号已被注册");
        }

        // 检查邮箱是否存在
        if (request.getEmail() != null && !request.getEmail().isEmpty() &&
                userProfileRepository.countByEmail(request.getEmail()) > 0) {
            throw new Exception("邮箱已被注册");
        }

        // 创建新用户档案 - 使用 UserProfile 实体
        UserProfile userProfile = new UserProfile();
        userProfile.setUsername(request.getUsername());
        userProfile.setPhone(request.getPhone());
        userProfile.setEmail(request.getEmail());
        userProfile.setPassword(passwordEncoder.encode(request.getPassword()));
        userProfile.setRealName(request.getRealName());
        userProfile.setStatus(1);
        userProfile.setUserType("customer"); // 注册的用户默认为客户类型
        userProfile.setCreatedAt(LocalDateTime.now());
        userProfile.setUpdatedAt(LocalDateTime.now());
        userProfile.setDeleted(0);

        // 保存用户档案到 user_profiles 表
        userProfileRepository.insert(userProfile);
        log.info("用户注册成功: {}", userProfile.getId());

        // 自动登录
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(request.getUsername());
        loginRequest.setPassword(request.getPassword());
        loginRequest.setSysCode("APP");

        return login(loginRequest);
    }

    /**
     * 刷新Token
     */
    @Override
    public LoginResponse refreshToken(String token) throws Exception {
        log.info("刷新Token");

        // 提取token（移除Bearer前缀）
        String cleanToken = extractToken(token);

        // 验证refresh token
        if (!jwtTokenProvider.validateToken(cleanToken)) {
            throw new Exception("刷新令牌无效或已过期");
        }

        // 获取用户名
        String username = jwtTokenProvider.getUsernameFromToken(cleanToken);
        if (username == null) {
            throw new Exception("无法从令牌中获取用户信息");
        }

        // 查询用户
        User user = userRepository.selectByUsername(username);
        if (user == null) {
            throw new Exception("用户不存在");
        }

        // 生成新的access token
        String newAccessToken = jwtTokenProvider.generateTokenFromUsername(username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(username);

        // 更新缓存的refresh token
        cacheRefreshToken(username, newRefreshToken);

        log.info("Token刷新成功: {}", user.getId());
        return buildLoginResponse(user, newAccessToken, newRefreshToken);
    }

    /**
     * 用户登出
     */
    @Override
    public void logout(String token) {
        log.info("用户登出");

        // 提取token
        String cleanToken = extractToken(token);

        // 从redis中删除该用户的refresh token
        try {
            String username = jwtTokenProvider.getUsernameFromToken(cleanToken);
            if (username != null) {
                redisTemplate.delete("refresh_token:" + username);
                log.info("用户登出成功: {}", username);
            }
        } catch (Exception e) {
            log.error("登出异常", e);
        }
    }

    /**
     * 发送验证码
     */
    @Override
    public void sendVerificationCode(String phone) throws Exception {
        log.info("发送验证码: {}", phone);

        String code = generateVerificationCode();

        boolean sent = smsService.sendVerificationCode(phone, code);
        if (!sent) {
            throw new Exception("验证码发送失败，请稍后重试");
        }

        String key = "verify_code:" + phone;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);

        log.info("验证码已发送并缓存: phone={}", phone);
    }

    private String generateVerificationCode() {
        int max = (int) Math.pow(10, codeLength) - 1;
        int min = (int) Math.pow(10, codeLength - 1);
        return String.valueOf(min + (int) (Math.random() * (max - min + 1)));
    }

    /**
     * 验证验证码
     */
    @Override
    public boolean verifyCode(String phone, String code) {
        log.info("验证验证码: {}", phone);

        try {
            // 从Redis获取验证码
            String cachedCode = redisTemplate.opsForValue().get("verify_code:" + phone);

            if (cachedCode == null) {
                log.warn("验证码已过期: {}", phone);
                return false;
            }

            if (!cachedCode.equals(code)) {
                log.warn("验证码错误: {}", phone);
                return false;
            }

            // 验证成功后删除验证码
            redisTemplate.delete("verify_code:" + phone);
            log.info("验证码验证成功: {}", phone);
            return true;
        } catch (Exception e) {
            log.error("验证码验证异常", e);
            return false;
        }
    }

    /**
     * 重置密码
     */
    @Override
    @Transactional
    public void resetPassword(String phone, String newPassword) throws Exception {
        log.info("重置密码: {}", phone);

        // 先尝试从user_profiles表查询
        UserProfile userProfile = userProfileRepository.selectByPhone(phone);
        if (userProfile != null) {
            // 更新user_profiles表
            String encryptedPassword = passwordEncoder.encode(newPassword);
            userProfile.setPassword(encryptedPassword);
            userProfile.setUpdatedAt(LocalDateTime.now());
            userProfileRepository.updateById(userProfile);
            log.info("密码重置成功 (user_profiles): {}", userProfile.getId());
            return;
        }

        // 如果user_profiles表中没有，尝试从users表查询
        User user = userRepository.selectByPhone(phone);
        if (user == null) {
            throw new Exception("用户不存在");
        }

        // 这里可能会失败，因为users可能是视图
        try {
            // 更新密码
            String encryptedPassword = passwordEncoder.encode(newPassword);
            userRepository.updatePassword(user.getId(), encryptedPassword);
            log.info("密码重置成功 (users): {}", user.getId());
        } catch (Exception e) {
            log.warn("更新users表失败，可能是视图: {}", e.getMessage());
            throw new Exception("密码重置失败: " + e.getMessage());
        }
    }

    /**
     * 修改密码
     */
    @Override
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) throws Exception {
        log.info("修改密码: userId={}", userId);

        // 查询用户
        User user = userRepository.selectById(userId);
        if (user == null) {
            throw new Exception("用户不存在");
        }

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new Exception("旧密码错误");
        }

        // 更新新密码
        String encryptedPassword = passwordEncoder.encode(newPassword);
        userRepository.updatePassword(userId, encryptedPassword);

        log.info("密码修改成功: {}", userId);
    }

    /**
     * 根据用户名、手机号或邮箱查询用户
     */
    private User findUserByCredential(String credential) {
        // 先查询users表
        User user = userRepository.selectByUsername(credential);
        if (user != null) {
            return user;
        }

        user = userRepository.selectByPhone(credential);
        if (user != null) {
            return user;
        }

        user = userRepository.selectByEmail(credential);
        if (user != null) {
            return user;
        }
        
        // 如果users表中没有，查询user_profiles表
        UserProfile userProfile = userProfileRepository.selectByUsername(credential);
        if (userProfile != null) {
            // 将UserProfile转换为User
            User convertedUser = new User();
            convertedUser.setId(userProfile.getId());
            convertedUser.setUsername(userProfile.getUsername());
            convertedUser.setPassword(userProfile.getPassword());
            convertedUser.setEmail(userProfile.getEmail());
            convertedUser.setRealName(userProfile.getRealName());
            convertedUser.setPhone(userProfile.getPhone());
            convertedUser.setRole(userProfile.getUserType()); // 将userType映射为role
            convertedUser.setStatus(userProfile.getStatus());
            convertedUser.setAvatarUrl(userProfile.getAvatarUrl());
            convertedUser.setDeleted(userProfile.getDeleted());
            convertedUser.setCreatedAt(userProfile.getCreatedAt());
            convertedUser.setUpdatedAt(userProfile.getUpdatedAt());
            convertedUser.setLastLoginAt(userProfile.getLastLoginAt());
            return convertedUser;
        }
        
        userProfile = userProfileRepository.selectByPhone(credential);
        if (userProfile != null) {
            // 将UserProfile转换为User
            User convertedUser = new User();
            convertedUser.setId(userProfile.getId());
            convertedUser.setUsername(userProfile.getUsername());
            convertedUser.setPassword(userProfile.getPassword());
            convertedUser.setEmail(userProfile.getEmail());
            convertedUser.setRealName(userProfile.getRealName());
            convertedUser.setPhone(userProfile.getPhone());
            convertedUser.setRole(userProfile.getUserType()); // 将userType映射为role
            convertedUser.setStatus(userProfile.getStatus());
            convertedUser.setAvatarUrl(userProfile.getAvatarUrl());
            convertedUser.setDeleted(userProfile.getDeleted());
            convertedUser.setCreatedAt(userProfile.getCreatedAt());
            convertedUser.setUpdatedAt(userProfile.getUpdatedAt());
            convertedUser.setLastLoginAt(userProfile.getLastLoginAt());
            return convertedUser;
        }
        
        userProfile = userProfileRepository.selectByEmail(credential);
        if (userProfile != null) {
            // 将UserProfile转换为User
            User convertedUser = new User();
            convertedUser.setId(userProfile.getId());
            convertedUser.setUsername(userProfile.getUsername());
            convertedUser.setPassword(userProfile.getPassword());
            convertedUser.setEmail(userProfile.getEmail());
            convertedUser.setRealName(userProfile.getRealName());
            convertedUser.setPhone(userProfile.getPhone());
            convertedUser.setRole(userProfile.getUserType()); // 将userType映射为role
            convertedUser.setStatus(userProfile.getStatus());
            convertedUser.setAvatarUrl(userProfile.getAvatarUrl());
            convertedUser.setDeleted(userProfile.getDeleted());
            convertedUser.setCreatedAt(userProfile.getCreatedAt());
            convertedUser.setUpdatedAt(userProfile.getUpdatedAt());
            convertedUser.setLastLoginAt(userProfile.getLastLoginAt());
            return convertedUser;
        }
        
        return null;
    }

    /**
     * 缓存刷新令牌
     */
    private void cacheRefreshToken(String username, String refreshToken) {
        // 刷新令牌的有效期为7天
        redisTemplate.opsForValue().set(
                "refresh_token:" + username,
                refreshToken,
                7,
                TimeUnit.DAYS);
    }

    /**
     * 提取令牌（移除Bearer前缀）
     */
    private String extractToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return token;
    }

    /**
     * 构建登录响应
     */
    private LoginResponse buildLoginResponse(User user, String accessToken, String refreshToken) {
        LoginResponse resp = new LoginResponse();
        resp.setAccessToken(accessToken);
        resp.setRefreshToken(refreshToken);
        resp.setTokenType("Bearer");
        resp.setExpiresIn(jwtExpiration);
        resp.setUserId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setPhone(user.getPhone());
        resp.setEmail(user.getEmail());
        resp.setRealName(user.getRealName());
        resp.setAvatarUrl(user.getAvatarUrl());
        resp.setRole(user.getRole());
        return resp;
    }
}

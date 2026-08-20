package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.dto.UserLoginRequest;
import com.shoppro.dto.UserRegisterRequest;
import com.shoppro.entity.User;
import com.shoppro.repository.UserRepository;
import com.shoppro.repository.UserProfileRepository;
import com.shoppro.security.JwtTokenProvider;
import com.shoppro.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * 用户业务实现
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserRepository, User> implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final RedisTemplate<String, String> redisTemplate;

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private static final String LOGIN_ATTEMPT_KEY = "login:attempts:";
    private static final String TOKEN_BLACKLIST_KEY = "token:blacklist:";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOGIN_LOCK_DURATION = 30; // 分钟

    public UserServiceImpl(UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager,
            RedisTemplate<String, String> redisTemplate) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.redisTemplate = redisTemplate;
    }

    @Override
    @Transactional
    public User register(UserRegisterRequest request) {
        // 检查用户名是否存在
        if (checkUsernameExists(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否存在
        if (StringUtils.hasText(request.getEmail()) && checkEmailExists(request.getEmail())) {
            throw new RuntimeException("邮箱已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRealName(request.getRealName());
        user.setPhone(request.getPhone());
        user.setRole("user");
        user.setStatus(1); // 1-正常
        user.setCreatedAt(LocalDateTime.now());

        boolean result = this.save(user);
        if (!result) {
            throw new RuntimeException("用户注册失败");
        }

        logger.info("用户注册成功: " + user.getUsername());
        return user;
    }

    @Override
    public String login(UserLoginRequest request) {
        String username = request.getUsername();

        // 检查登录尝试次数
        String attemptKey = LOGIN_ATTEMPT_KEY + username;
        String attempts = redisTemplate.opsForValue().get(attemptKey);
        if (attempts != null && Integer.parseInt(attempts) >= MAX_LOGIN_ATTEMPTS) {
            throw new RuntimeException("登录尝试次数过多，请30分钟后再试");
        }

        try {
            // 使用AuthenticationManager认证
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.getPassword()));

            // 清除登录失败计数
            redisTemplate.delete(attemptKey);

            // 生成Token
            String token = tokenProvider.generateToken(authentication);

            // 获取当前用户
            User user = userRepository.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getUsername, username));

            // 更新最后登录时间
            if (user != null) {
                LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
                updateWrapper.eq(User::getId, user.getId())
                        .set(User::getLastLoginAt, LocalDateTime.now());
                this.update(null, updateWrapper);
            }

            logger.info("用户登录成功: " + username);
            return token;

        } catch (Exception e) {
            // 增加登录失败计数
            String attemptKey2 = LOGIN_ATTEMPT_KEY + username;
            String currentAttempts = redisTemplate.opsForValue().get(attemptKey2);
            int newAttempts = (currentAttempts == null) ? 1 : Integer.parseInt(currentAttempts) + 1;
            redisTemplate.opsForValue().set(attemptKey2, String.valueOf(newAttempts), LOGIN_LOCK_DURATION,
                    TimeUnit.MINUTES);

            logger.warn("用户登录失败: " + username + " - " + e.getMessage());
            throw new RuntimeException("用户名或密码错误");
        }
    }

    @Override
    public String refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("刷新令牌无效或已过期");
        }

        String newAccessToken = tokenProvider.refreshToken(refreshToken);
        if (newAccessToken == null) {
            throw new RuntimeException("令牌刷新失败");
        }

        return newAccessToken;
    }

    @Override
    public User getCurrentUser(String token) {
        if (!tokenProvider.validateToken(token)) {
            throw new RuntimeException("令牌无效或已过期");
        }

        String username = tokenProvider.getUsernameFromToken(token);
        return userRepository.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username));
    }

    @Override
    public Page<User> listUsers(int pageNo, int pageSize, String keyword, Integer roleFilter, Boolean isAdminOnly,
            Long enterpriseId, String sortBy, String sortOrder) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();

        // 🛡️ 灵活过滤：仅在请求管理员列表时才限制角色
        if (Boolean.TRUE.equals(isAdminOnly)) {
            wrapper.inSql(User::getId,
                    "SELECT ur.user_id FROM user_roles ur " +
                            "JOIN roles r ON ur.role_id = r.id " +
                            "WHERE r.code IN ('super_admin', 'platform_admin', 'enterprise_admin')");
        } else if (roleFilter != null) {
            // 如果指定了特定角色 ID
            wrapper.inSql(User::getId, "SELECT user_id FROM user_roles WHERE role_id = " + roleFilter);
        }

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(User::getUsername, keyword)
                    .or().like(User::getRealName, keyword)
                    .or().like(User::getEmail, keyword)
                    .or().like(User::getPhone, keyword));
        }

        // 企业筛选
        if (enterpriseId != null) {
            wrapper.eq(User::getEnterpriseId, enterpriseId);
        }

        wrapper.eq(User::getStatus, 1); // 只显示正常用户

        // 排序
        if (StringUtils.hasText(sortBy)) {
            boolean isAsc = "asc".equalsIgnoreCase(sortOrder);
            switch (sortBy) {
                case "createdAt":
                    wrapper.orderBy(true, isAsc, User::getCreatedAt);
                    break;
                case "username":
                    wrapper.orderBy(true, isAsc, User::getUsername);
                    break;
                case "realName":
                    wrapper.orderBy(true, isAsc, User::getRealName);
                    break;
                default:
                    wrapper.orderByDesc(User::getCreatedAt);
            }
        } else {
            wrapper.orderByDesc(User::getCreatedAt);
        }

        return this.page(new Page<>(pageNo, pageSize), wrapper);
    }

    @Override
    public User createUser(User user) {
        // 检查用户名是否已存在
        if (checkUsernameExists(user.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查邮箱是否已存在
        if (user.getEmail() != null && checkEmailExists(user.getEmail())) {
            throw new RuntimeException("邮箱已被使用");
        }

        // 检查手机号是否已存在
        if (user.getPhone() != null) {
            User existingUser = userRepository.selectByPhone(user.getPhone());
            if (existingUser != null) {
                throw new RuntimeException("手机号已被使用");
            }
        }

        if (!StringUtils.hasText(user.getPassword())) {
            throw new RuntimeException("初始密码不能为空");
        }
        String rawPassword = user.getPassword();
        user.setPassword(passwordEncoder.encode(rawPassword));

        // 设置默认值
        if (user.getStatus() == null) {
            user.setStatus(1); // 默认启用
        }
        if (user.getRole() == null) {
            user.setRole("user"); // 默认普通用户角色
        }

        // 保存用户
        this.save(user);

        return user;
    }

    @Override
    public User getUserDetail(Long userId) {
        User user = this.getById(userId);
        if (user == null || user.getStatus() == 0) {
            throw new RuntimeException("用户不存在");
        }
        // 不返回密码
        user.setPassword(null);
        return user;
    }

    @Override
    @Transactional
    public boolean updateUserInfo(Long userId, User userInfo) {
        logger.info("=== updateUserInfo START ===");
        logger.info("userId: {}", userId);
        logger.info("userInfo: {}", userInfo);

        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        logger.info("Current user from DB: {}", user);

        int result = userRepository.updateUserInfoDirect(
                userId,
                userInfo.getRealName() != null ? userInfo.getRealName() : user.getRealName(),
                userInfo.getPhone() != null ? userInfo.getPhone() : user.getPhone(),
                userInfo.getEmail() != null ? userInfo.getEmail() : user.getEmail(),
                userInfo.getRole() != null ? userInfo.getRole() : user.getRole(),
                userInfo.getEnterpriseId() != null ? userInfo.getEnterpriseId() : user.getEnterpriseId(),
                userInfo.getSalesTargets() != null ? userInfo.getSalesTargets() : user.getSalesTargets());

        logger.info("updateUserInfoDirect result: {}", result);
        logger.info("=== updateUserInfo END ===");

        return result > 0;
    }

    @Override
    @Transactional
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("旧密码不正确");
        }

        // 更新密码
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId)
                .set(User::getPassword, passwordEncoder.encode(newPassword))
                .set(User::getUpdatedAt, LocalDateTime.now());

        logger.info("用户修改密码: " + user.getUsername());
        return this.update(null, updateWrapper);
    }

    @Override
    @Transactional
    public boolean resetPassword(Long userId, String newPassword) {
        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        if (!StringUtils.hasText(newPassword) || newPassword.length() < 8) {
            throw new RuntimeException("新密码至少需要8位");
        }
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId)
                .set(User::getPassword, passwordEncoder.encode(newPassword))
                .set(User::getUpdatedAt, LocalDateTime.now());

        logger.warn("用户密码已重置: " + user.getUsername());
        return this.update(null, updateWrapper);
    }

    @Override
    @Transactional
    public boolean toggleUserStatus(Long userId) {
        User user = this.getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        int newStatus = user.getStatus() == 1 ? 0 : 1;
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId)
                .set(User::getStatus, newStatus)
                .set(User::getUpdatedAt, LocalDateTime.now());

        logger.info("用户状态已切换: " + user.getUsername() + " -> " + newStatus);
        return this.update(null, updateWrapper);
    }

    @Override
    public boolean checkUsernameExists(String username) {
        return userRepository.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, username)) > 0;
    }

    @Override
    public boolean checkEmailExists(String email) {
        return userRepository.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, email)) > 0;
    }

    @Override
    @Transactional
    public int bulkImportUsers(String csvContent) {
        // 简单的CSV导入逻辑
        String[] lines = csvContent.split("\n");
        int successCount = 0;

        for (String line : lines) {
            if (line.trim().isEmpty())
                continue;

            try {
                String[] fields = line.split(",");
                if (fields.length < 4)
                    continue;

                String username = fields[0].trim();
                String email = fields[1].trim();
                String realName = fields[2].trim();
                String password = fields[3].trim();
                if (password.length() < 8) continue;

                if (checkUsernameExists(username)) {
                    logger.warn("用户名已存在，跳过: " + username);
                    continue;
                }

                User user = new User();
                user.setUsername(username);
                user.setEmail(email);
                user.setRealName(realName);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole("user");
                user.setStatus(1);
                user.setCreatedAt(LocalDateTime.now());

                if (this.save(user)) {
                    successCount++;
                }
            } catch (Exception e) {
                logger.error("导入用户失败: " + line + " - " + e.getMessage());
            }
        }

        logger.info("批量导入用户完成: 成功" + successCount + "条");
        return successCount;
    }

    @Override
    public List<User> getUsersByEnterpriseId(Long enterpriseId) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEnterpriseId, enterpriseId);
        wrapper.orderByDesc(User::getCreatedAt);
        return userRepository.selectList(wrapper);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public User getByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        return userRepository.selectOne(wrapper);
    }
}

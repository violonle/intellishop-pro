package com.shoppro.security;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.shoppro.entity.User;
import com.shoppro.repository.UserRepository;
import com.shoppro.security.LoginUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;

/**
 * 自定义用户详情服务
 * 从数据库加载用户信息并构建Spring Security的UserDetails对象
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 通过用户名加载用户详情
     *
     * @param username 用户名
     * @return UserDetails对象
     * @throws UsernameNotFoundException 用户未找到异常
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 从数据库查询用户
        User user = userRepository.selectOne(
                Wrappers.<User>lambdaQuery()
                        .eq(User::getUsername, username));

        if (user == null) {
            log.warn("用户未找到: {}", username);
            throw new UsernameNotFoundException("用户名不存在: " + username);
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            log.warn("用户已禁用: {}", username);
            throw new UsernameNotFoundException("用户已禁用");
        }

        // 构建权限列表
        Collection<GrantedAuthority> authorities = buildAuthorities(user.getRole());

        log.debug("用户加载成功: {}, 角色: {}", username, user.getRole());

        // 构建并返回LoginUser对象
        return new LoginUser(user, authorities);
    }

    /**
     * 根据用户角色构建权限列表
     *
     * @param role 用户角色 (user, sales, manager, admin)
     * @return 权限集合
     */
    private Collection<GrantedAuthority> buildAuthorities(String role) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        if (role == null || role.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            return authorities;
        }

        // 添加基础角色
        switch (role.toLowerCase()) {
            case "super_admin":
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
                // Super admin also gets all other roles
            case "admin":
            case "platform_admin":
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                authorities.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
                // 下降到manager权限
            case "enterprise_admin":
            case "sales_director":
            case "sales_manager":
            case "manager":
                authorities.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
                // 下降到sales权限
            case "salesman": // Support init.sql role
            case "sales":
                authorities.add(new SimpleGrantedAuthority("ROLE_SALES"));
                // 下降到user权限
            case "user":
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                break;
            default:
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return authorities;
    }

    /**
     * 通过用户ID加载用户详情
     * 便于Token中存储用户ID时使用
     *
     * @param userId 用户ID
     * @return UserDetails对象
     * @throws UsernameNotFoundException 用户未找到异常
     */
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        User user = userRepository.selectById(userId);

        if (user == null) {
            log.warn("用户ID未找到: {}", userId);
            throw new UsernameNotFoundException("用户不存在: " + userId);
        }

        if (user.getStatus() == 0) {
            log.warn("用户已禁用: {}", userId);
            throw new UsernameNotFoundException("用户已禁用");
        }

        Collection<GrantedAuthority> authorities = buildAuthorities(user.getRole());

        return new LoginUser(user, authorities);
    }
}

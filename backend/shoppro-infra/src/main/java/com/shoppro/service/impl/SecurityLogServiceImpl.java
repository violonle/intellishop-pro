package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.SecurityLog;
import com.shoppro.repository.SecurityLogRepository;
import com.shoppro.service.SecurityLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SecurityLogServiceImpl implements SecurityLogService {

    private static final Logger log = LoggerFactory.getLogger(SecurityLogServiceImpl.class);

    private final SecurityLogRepository securityLogRepository;

    public SecurityLogServiceImpl(SecurityLogRepository securityLogRepository) {
        this.securityLogRepository = securityLogRepository;
    }

    @Async
    @Override
    public void logLoginSuccess(Long userId, String username, String ipAddress, String userAgent) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setUserId(userId);
        securityLog.setUsername(username);
        securityLog.setAction(SecurityLog.ACTION_LOGIN_SUCCESS);
        securityLog.setIpAddress(ipAddress);
        securityLog.setUserAgent(userAgent);
        securityLog.setResult("SUCCESS");
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        log.info("安全日志: 用户 {} 登录成功, IP: {}", username, ipAddress);
    }

    @Async
    @Override
    public void logLoginFail(String username, String ipAddress, String userAgent, String reason) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setUsername(username);
        securityLog.setAction(SecurityLog.ACTION_LOGIN_FAIL);
        securityLog.setIpAddress(ipAddress);
        securityLog.setUserAgent(userAgent);
        securityLog.setResult("FAILED");
        securityLog.setFailureReason(reason);
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        log.warn("安全日志: 用户 {} 登录失败, 原因: {}, IP: {}", username, reason, ipAddress);
    }

    @Async
    @Override
    public void logLogout(Long userId, String username, String ipAddress) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setUserId(userId);
        securityLog.setUsername(username);
        securityLog.setAction(SecurityLog.ACTION_LOGOUT);
        securityLog.setIpAddress(ipAddress);
        securityLog.setResult("SUCCESS");
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        log.info("安全日志: 用户 {} 退出登录, IP: {}", username, ipAddress);
    }

    @Async
    @Override
    public void logPermissionDenied(Long userId, String username, String resource, String ipAddress) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setUserId(userId);
        securityLog.setUsername(username);
        securityLog.setAction(SecurityLog.ACTION_PERMISSION_DENIED);
        securityLog.setResource(resource);
        securityLog.setIpAddress(ipAddress);
        securityLog.setResult("DENIED");
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        warn("安全日志: 用户 {} 访问被拒绝, 资源: {}, IP: {}", username, resource, ipAddress);
    }

    @Async
    @Override
    public void logSensitiveDataAccess(Long userId, String username, String resource, String ipAddress) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setUserId(userId);
        securityLog.setUsername(username);
        securityLog.setAction(SecurityLog.ACTION_SENSITIVE_DATA_ACCESS);
        securityLog.setResource(resource);
        securityLog.setIpAddress(ipAddress);
        securityLog.setResult("SUCCESS");
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        log.info("安全日志: 用户 {} 访问敏感数据, 资源: {}, IP: {}", username, resource, ipAddress);
    }

    @Async
    @Override
    public void logSensitiveDataExport(Long userId, String username, String resource, String ipAddress) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setUserId(userId);
        securityLog.setUsername(username);
        securityLog.setAction(SecurityLog.ACTION_SENSITIVE_DATA_EXPORT);
        securityLog.setResource(resource);
        securityLog.setIpAddress(ipAddress);
        securityLog.setResult("SUCCESS");
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        log.info("安全日志: 用户 {} 导出敏感数据, 资源: {}, IP: {}", username, resource, ipAddress);
    }

    @Async
    @Override
    public void logRateLimitExceeded(String ipAddress, String userAgent) {
        SecurityLog securityLog = new SecurityLog();
        securityLog.setAction(SecurityLog.ACTION_RATE_LIMIT_EXCEEDED);
        securityLog.setIpAddress(ipAddress);
        securityLog.setUserAgent(userAgent);
        securityLog.setResult("BLOCKED");
        securityLog.setCreatedAt(LocalDateTime.now());
        
        securityLogRepository.insert(securityLog);
        log.warn("安全日志: IP {} 超过速率限制, UA: {}", ipAddress, userAgent);
    }

    @Override
    public Page<SecurityLog> list(int page, int size, String action, String username, String ipAddress) {
        LambdaQueryWrapper<SecurityLog> wrapper = new LambdaQueryWrapper<>();
        
        if (action != null && !action.isEmpty()) {
            wrapper.eq(SecurityLog::getAction, action);
        }
        
        if (username != null && !username.isEmpty()) {
            wrapper.like(SecurityLog::getUsername, username);
        }
        
        if (ipAddress != null && !ipAddress.isEmpty()) {
            wrapper.like(SecurityLog::getIpAddress, ipAddress);
        }
        
        wrapper.orderByDesc(SecurityLog::getCreatedAt);
        
        return securityLogRepository.selectPage(new Page<>(page, size), wrapper);
    }

    private void warn(String format, Object... args) {
        log.warn(format, args);
    }
}

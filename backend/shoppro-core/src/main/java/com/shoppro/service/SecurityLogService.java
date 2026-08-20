package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.SecurityLog;

public interface SecurityLogService {
    
    void logLoginSuccess(Long userId, String username, String ipAddress, String userAgent);
    
    void logLoginFail(String username, String ipAddress, String userAgent, String reason);
    
    void logLogout(Long userId, String username, String ipAddress);
    
    void logPermissionDenied(Long userId, String username, String resource, String ipAddress);
    
    void logSensitiveDataAccess(Long userId, String username, String resource, String ipAddress);
    
    void logSensitiveDataExport(Long userId, String username, String resource, String ipAddress);
    
    void logRateLimitExceeded(String ipAddress, String userAgent);
    
    Page<SecurityLog> list(int page, int size, String action, String username, String ipAddress);
}

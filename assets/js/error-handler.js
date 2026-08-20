/**
 * ShopPro 全局错误处理系统
 * 统一处理所有API和应用错误
 * @version 1.0.0
 * @author ShopPro Team
 */

class ErrorHandler {
    /**
     * 错误处理配置
     */
    static config = {
        maxRetries: 3,
        retryDelay: 1000,
        logEnabled: true,
        reportEnabled: true,
        deduplicationEnabled: true
    };

    /**
     * 错误缓存（用于去重）
     */
    static errorCache = new Map();
    static cacheTimeout = 5000; // 5秒内相同错误只显示一次

    /**
     * 错误日志
     */
    static logs = [];
    static maxLogs = 100;

    /**
     * 分类错误
     * @param {Error} error - 错误对象
     * @returns {Object} 分类结果
     */
    static classify(error) {
        // 网络错误
        if (error.message === 'timeout' || error.name === 'AbortError') {
            return { 
                type: 'NetworkError', 
                subtype: 'Timeout', 
                severity: 'warning',
                retryable: true
            };
        }

        if (error.code === 'ECONNREFUSED' || error.message.includes('failed to fetch')) {
            return { 
                type: 'NetworkError', 
                subtype: 'ConnectionRefused', 
                severity: 'error',
                retryable: true
            };
        }

        if (error.code === 'ENOTFOUND' || error.message.includes('DNS')) {
            return { 
                type: 'NetworkError', 
                subtype: 'DNSFailed', 
                severity: 'error',
                retryable: true
            };
        }

        if (navigator.onLine === false) {
            return { 
                type: 'NetworkError', 
                subtype: 'Offline', 
                severity: 'warning',
                retryable: false
            };
        }

        // HTTP 错误
        if (error.status) {
            const status = error.status;
            
            if (status === 400) {
                return { 
                    type: 'ValidationError', 
                    subtype: 'BadRequest', 
                    severity: 'warning',
                    retryable: false
                };
            }
            
            if (status === 401) {
                return { 
                    type: 'AuthenticationError', 
                    subtype: 'Unauthorized', 
                    severity: 'error',
                    retryable: false
                };
            }
            
            if (status === 403) {
                return { 
                    type: 'AuthenticationError', 
                    subtype: 'Forbidden', 
                    severity: 'error',
                    retryable: false
                };
            }
            
            if (status === 404) {
                return { 
                    type: 'ServerError', 
                    subtype: 'NotFound', 
                    severity: 'info',
                    retryable: false
                };
            }
            
            if (status === 409) {
                return { 
                    type: 'ValidationError', 
                    subtype: 'DuplicateData', 
                    severity: 'warning',
                    retryable: false
                };
            }
            
            if (status === 500) {
                return { 
                    type: 'ServerError', 
                    subtype: 'InternalError', 
                    severity: 'critical',
                    retryable: true
                };
            }
            
            if (status === 502 || status === 503) {
                return { 
                    type: 'ServerError', 
                    subtype: 'ServiceUnavailable', 
                    severity: 'critical',
                    retryable: true
                };
            }
            
            if (status === 504) {
                return { 
                    type: 'ServerError', 
                    subtype: 'GatewayTimeout', 
                    severity: 'error',
                    retryable: true
                };
            }
            
            // 其他HTTP错误
            if (status >= 500) {
                return { 
                    type: 'ServerError', 
                    subtype: `HTTP${status}`, 
                    severity: 'critical',
                    retryable: true
                };
            }
        }

        // 验证错误
        if (error.name === 'ValidationError') {
            return { 
                type: 'ValidationError', 
                subtype: error.field || 'Unknown', 
                severity: 'warning',
                retryable: false
            };
        }

        // 默认应用错误
        return { 
            type: 'ApplicationError', 
            subtype: 'Unknown', 
            severity: 'error',
            retryable: false
        };
    }

    /**
     * 统一错误处理
     * @param {Error} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 处理结果
     */
    static handle(error, context = {}) {
        // 1. 分类错误
        const classification = this.classify(error);

        // 2. 检查缓存（去重）
        if (this.config.deduplicationEnabled && this.isDuplicate(error, classification)) {
            console.log('重复错误，已忽略');
            return;
        }

        // 3. 记录到缓存
        this.cacheError(error, classification);

        // 4. 记录错误日志
        if (this.config.logEnabled) {
            this.logError(error, { ...context, classification });
        }

        // 5. 上报错误
        if (this.config.reportEnabled && classification.severity === 'critical') {
            this.reportError(error, { ...context, classification });
        }

        // 6. 获取用户友好的错误信息
        const userMessage = this.getErrorMessage(error, classification);

        // 7. 显示用户提示
        this.showUserNotification(userMessage, classification);

        // 8. 返回处理结果
        return {
            classified: true,
            type: classification.type,
            subtype: classification.subtype,
            severity: classification.severity,
            message: userMessage,
            originalError: error,
            retryable: classification.retryable
        };
    }

    /**
     * 检查是否是重复错误
     * @param {Error} error 
     * @param {Object} classification 
     */
    static isDuplicate(error, classification) {
        const key = `${classification.type}-${classification.subtype}`;
        const cached = this.errorCache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return true;
        }
        
        return false;
    }

    /**
     * 缓存错误
     * @param {Error} error 
     * @param {Object} classification 
     */
    static cacheError(error, classification) {
        const key = `${classification.type}-${classification.subtype}`;
        this.errorCache.set(key, {
            error,
            classification,
            timestamp: Date.now()
        });
    }

    /**
     * 获取用户友好的错误信息
     * @param {Error} error 
     * @param {Object} classification 
     */
    static getErrorMessage(error, classification = {}) {
        const messages = {
            // 网络错误
            'NetworkError-Timeout': '请求超时，请检查网络连接后重试',
            'NetworkError-ConnectionRefused': '无法连接到服务器，请检查网络或稍后重试',
            'NetworkError-DNSFailed': '网络连接失败，请检查网络设置',
            'NetworkError-Offline': '您已离线，请检查网络连接',

            // 认证错误
            'AuthenticationError-Unauthorized': '您的登录已过期，请重新登录',
            'AuthenticationError-Forbidden': '您没有权限执行此操作',

            // 服务器错误
            'ValidationError-BadRequest': '请求参数错误，请检查输入内容',
            'ServerError-NotFound': '请求的资源不存在',
            'ServerError-InternalError': '服务器错误，请稍后重试',
            'ServerError-ServiceUnavailable': '服务暂时不可用，请稍后重试',
            'ServerError-GatewayTimeout': '服务器响应超时，请稍后重试',

            // 验证错误
            'ValidationError-DuplicateData': '数据已存在',
            'ValidationError-Unknown': '输入数据不符合要求',

            // 默认
            'Default': '发生错误，请稍后重试'
        };

        const classKey = classification.type ? 
            `${classification.type}-${classification.subtype}` : 'Default';
        
        return messages[classKey] || messages.Default;
    }

    /**
     * 记录错误日志
     * @param {Error} error 
     * @param {Object} context 
     */
    static logError(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code,
                status: error.status
            },
            context
        };

        // 添加到内存日志
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // 记录到浏览器控制台
        console.group(`[${context.classification?.severity?.toUpperCase() || 'ERROR'}] ${error.name}`);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('Context:', context);
        console.groupEnd();

        // 保存到localStorage（用于调试）
        try {
            const allLogs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
            allLogs.push(logEntry);
            if (allLogs.length > 50) allLogs.shift();
            localStorage.setItem('app_error_logs', JSON.stringify(allLogs));
        } catch (e) {
            // 忽略localStorage错误
        }
    }

    /**
     * 上报错误到服务器
     * @param {Error} error 
     * @param {Object} context 
     */
    static reportError(error, context = {}) {
        // 异步上报，不阻塞主流程
        setTimeout(async () => {
            try {
                const reportData = {
                    type: context.classification?.type,
                    severity: context.classification?.severity,
                    message: error.message,
                    stack: error.stack,
                    context: context,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                };

                // 这里可以替换为实际的错误收集服务
                console.log('上报错误到服务器:', reportData);

                // 示例：可以使用 fetch 上报
                // await fetch('/api/errors/report', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(reportData)
                // });
            } catch (e) {
                console.error('上报错误失败:', e);
            }
        }, 0);
    }

    /**
     * 显示用户提示
     * @param {string} message 
     * @param {Object} classification 
     */
    static showUserNotification(message, classification = {}) {
        const severity = classification.severity || 'error';
        
        if (UI && typeof UI.showMessage === 'function') {
            // 将 severity 映射到 message 类型
            const messageType = severity === 'critical' ? 'error' : severity;
            UI.showMessage(message, messageType, severity === 'info' ? 3000 : 5000);
        } else {
            // 备选方案：使用浏览器原生提示
            alert(message);
        }
    }

    /**
     * 重试机制
     * @param {Function} fn 
     * @param {Object} options 
     */
    static async retry(fn, options = {}) {
        const {
            maxRetries = this.config.maxRetries,
            delay = this.config.retryDelay,
            backoff = true,
            onRetry = null
        } = options;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxRetries) throw error;

                // 计算延迟时间（指数退避）
                const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;

                if (onRetry) {
                    onRetry(attempt, error, waitTime);
                }

                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    /**
     * 清空错误缓存
     */
    static clearErrorCache() {
        this.errorCache.clear();
    }

    /**
     * 清空错误日志
     */
    static clearLogs() {
        this.logs = [];
        try {
            localStorage.removeItem('app_error_logs');
        } catch (e) {
            // 忽略
        }
    }

    /**
     * 导出错误日志
     * @param {string} format - json|csv
     */
    static exportLogs(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.logs, null, 2);
        } else if (format === 'csv') {
            let csv = '时间,类型,消息,上下文\n';
            this.logs.forEach(log => {
                csv += `"${log.timestamp}","${log.error.name}","${log.error.message}","${JSON.stringify(log.context)}"\n`;
            });
            return csv;
        }
        return '';
    }

    /**
     * 获取错误统计
     */
    static getStats() {
        const stats = {
            total: this.logs.length,
            byType: {},
            bySeverity: {},
            recent: this.logs.slice(-10)
        };

        this.logs.forEach(log => {
            const type = log.error.name;
            const severity = log.context.classification?.severity || 'unknown';

            stats.byType[type] = (stats.byType[type] || 0) + 1;
            stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
        });

        return stats;
    }
}

// 导出全局使用
window.ErrorHandler = ErrorHandler;

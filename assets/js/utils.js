/*!
 * ShopPro Utilities
 * 数据格式化、表单验证、通用工具函数
 * @version 1.0.0
 * @author ShopPro Team
 */

class ShopProUtils {
    constructor() {
        this.init();
    }
    
    init() {
        // 初始化国际化
        this.initI18n();
        
        // 绑定全局事件
        this.bindGlobalEvents();
    }
    
    /**
     * 初始化国际化
     */
    initI18n() {
        this.locale = localStorage.getItem('app-locale') || 'zh-CN';
        this.i18n = {
            'zh-CN': {
                'loading': '加载中...',
                'success': '操作成功',
                'error': '操作失败',
                'confirm': '确认',
                'cancel': '取消',
                'delete_confirm': '确定要删除吗？',
                'save_success': '保存成功',
                'delete_success': '删除成功',
                'network_error': '网络连接异常，请稍后重试',
                'permission_denied': '权限不足，请联系管理员',
                'data_not_found': '数据不存在',
                'invalid_input': '输入数据不正确'
            }
        };
    }
    
    /**
     * 获取本地化文本
     */
    t(key, defaultValue = '') {
        return this.i18n[this.locale]?.[key] || defaultValue || key;
    }
    
    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 监听网络状态变化
        window.addEventListener('online', () => {
            UI.showMessage('网络连接已恢复', 'success', 2000);
        });
        
        window.addEventListener('offline', () => {
            UI.showMessage('网络连接已断开', 'warning', 0);
        });
        
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // 页面变为可见时刷新数据
                this.triggerDataRefresh();
            }
        });
    }
    
    /**
     * 触发数据刷新事件
     */
    triggerDataRefresh() {
        const event = new CustomEvent('dataRefresh');
        document.dispatchEvent(event);
    }
    
    // ========== 数据格式化工具 ==========
    
    /**
     * 格式化日期
     * @param {Date|string|number} date - 日期
     * @param {string} format - 格式化模式
     */
    formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }
    
    /**
     * 格式化相对时间
     * @param {Date|string|number} date 
     */
    formatRelativeTime(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;
        const month = 30 * day;
        
        if (diff < minute) {
            return '刚刚';
        } else if (diff < hour) {
            return Math.floor(diff / minute) + '分钟前';
        } else if (diff < day) {
            return Math.floor(diff / hour) + '小时前';
        } else if (diff < week) {
            return Math.floor(diff / day) + '天前';
        } else if (diff < month) {
            return Math.floor(diff / week) + '周前';
        } else {
            return this.formatDate(date, 'YYYY-MM-DD');
        }
    }
    
    /**
     * 格式化数字
     * @param {number} num - 数字
     * @param {number} precision - 小数位数
     * @param {boolean} useThousandSeparator - 是否使用千分位分隔符
     */
    formatNumber(num, precision = 2, useThousandSeparator = true) {
        if (isNaN(num) || num === null || num === undefined) return '';
        
        const fixed = Number(num).toFixed(precision);
        
        if (useThousandSeparator) {
            return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        return fixed;
    }
    
    /**
     * 格式化货币
     * @param {number} amount - 金额
     * @param {string} currency - 货币符号
     */
    formatCurrency(amount, currency = '¥') {
        const formatted = this.formatNumber(amount, 2, true);
        return `${currency}${formatted}`;
    }
    
    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const index = Math.floor(Math.log(bytes) / Math.log(1024));
        const size = (bytes / Math.pow(1024, index)).toFixed(2);
        
        return `${size} ${units[index]}`;
    }
    
    /**
     * 格式化百分比
     * @param {number} value - 值
     * @param {number} total - 总值
     * @param {number} precision - 小数位数
     */
    formatPercentage(value, total, precision = 1) {
        if (!total || total === 0) return '0%';
        
        const percentage = (value / total * 100).toFixed(precision);
        return `${percentage}%`;
    }
    
    // ========== 数据验证工具 ==========
    
    /**
     * 验证规则定义
     */
    validationRules = {
        required: (value) => {
            return value !== null && value !== undefined && value !== '';
        },
        
        email: (value) => {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(value);
        },
        
        phone: (value) => {
            const pattern = /^1[3-9]\d{9}$/;
            return pattern.test(value);
        },
        
        idCard: (value) => {
            const pattern = /^\d{17}[\dXx]$/;
            return pattern.test(value);
        },
        
        number: (value) => {
            return !isNaN(value) && isFinite(value);
        },
        
        integer: (value) => {
            return Number.isInteger(Number(value));
        },
        
        positive: (value) => {
            return Number(value) > 0;
        },
        
        min: (value, min) => {
            return Number(value) >= min;
        },
        
        max: (value, max) => {
            return Number(value) <= max;
        },
        
        minLength: (value, length) => {
            return String(value).length >= length;
        },
        
        maxLength: (value, length) => {
            return String(value).length <= length;
        },
        
        pattern: (value, regex) => {
            return new RegExp(regex).test(value);
        },
        
        url: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }
    };
    
    /**
     * 验证单个字段
     * @param {*} value - 字段值
     * @param {Array|Object} rules - 验证规则
     */
    validateField(value, rules) {
        const errors = [];
        
        // 如果规则是数组形式
        if (Array.isArray(rules)) {
            for (const rule of rules) {
                const result = this.validateSingleRule(value, rule);
                if (result !== true) {
                    errors.push(result);
                }
            }
        } else {
            // 如果规则是对象形式
            for (const [ruleName, ruleConfig] of Object.entries(rules)) {
                const result = this.validateSingleRule(value, { type: ruleName, ...ruleConfig });
                if (result !== true) {
                    errors.push(result);
                }
            }
        }
        
        return errors.length > 0 ? errors : true;
    }
    
    /**
     * 验证单个规则
     * @param {*} value - 值
     * @param {Object} rule - 规则对象
     */
    validateSingleRule(value, rule) {
        const { type, message, ...params } = rule;
        
        if (this.validationRules[type]) {
            const isValid = this.validationRules[type](value, ...Object.values(params));
            if (!isValid) {
                return message || this.getDefaultErrorMessage(type, params);
            }
        }
        
        return true;
    }
    
    /**
     * 获取默认错误消息
     */
    getDefaultErrorMessage(type, params) {
        const messages = {
            required: '此字段为必填项',
            email: '请输入有效的邮箱地址',
            phone: '请输入有效的手机号码',
            idCard: '请输入有效的身份证号码',
            number: '请输入数字',
            integer: '请输入整数',
            positive: '请输入正数',
            min: `值不能小于 ${params.min || 0}`,
            max: `值不能大于 ${params.max || 0}`,
            minLength: `长度不能少于 ${params.length || 0} 个字符`,
            maxLength: `长度不能超过 ${params.length || 0} 个字符`,
            pattern: '格式不正确',
            url: '请输入有效的URL'
        };
        
        return messages[type] || '验证失败';
    }
    
    /**
     * 验证表单
     * @param {HTMLFormElement|Object} form - 表单元素或数据对象
     * @param {Object} rules - 验证规则
     */
    validateForm(form, rules) {
        const errors = {};
        let isValid = true;
        
        // 获取表单数据
        const data = form instanceof HTMLFormElement ? this.getFormData(form) : form;
        
        // 验证每个字段
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = data[field];
            const result = this.validateField(value, fieldRules);
            
            if (result !== true) {
                errors[field] = result;
                isValid = false;
            }
        }
        
        return {
            isValid,
            errors,
            data
        };
    }
    
    /**
     * 获取表单数据
     * @param {HTMLFormElement} form 
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // 处理多选情况
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        return data;
    }
    
    /**
     * 显示表单验证错误
     * @param {HTMLFormElement} form 
     * @param {Object} errors 
     */
    showFormErrors(form, errors) {
        // 清除之前的错误显示
        this.clearFormErrors(form);
        
        for (const [field, fieldErrors] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                // 添加错误样式
                input.classList.add('error');
                
                // 创建错误消息元素
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
                
                // 插入错误消息
                input.parentNode.appendChild(errorEl);
            }
        }
    }
    
    /**
     * 清除表单错误显示
     * @param {HTMLFormElement} form 
     */
    clearFormErrors(form) {
        // 移除错误样式
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
        
        // 移除错误消息
        form.querySelectorAll('.error-message').forEach(el => {
            el.remove();
        });
    }
    
    // ========== 存储工具 ==========
    
    /**
     * 本地存储包装器
     */
    storage = {
        set: (key, value, expiry = null) => {
            const data = {
                value,
                timestamp: Date.now(),
                expiry: expiry ? Date.now() + expiry : null
            };
            localStorage.setItem(key, JSON.stringify(data));
        },
        
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                if (!item) return defaultValue;
                
                const data = JSON.parse(item);
                
                // 检查是否过期
                if (data.expiry && Date.now() > data.expiry) {
                    localStorage.removeItem(key);
                    return defaultValue;
                }
                
                return data.value;
            } catch {
                return defaultValue;
            }
        },
        
        remove: (key) => {
            localStorage.removeItem(key);
        },
        
        clear: () => {
            localStorage.clear();
        }
    };
    
    // ========== 工具函数 ==========
    
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * 深拷贝
     * @param {*} obj 
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    /**
     * 生成UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * 获取URL参数
     * @param {string} name - 参数名
     */
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    /**
     * 设置URL参数
     * @param {string} name - 参数名
     * @param {string} value - 参数值
     */
    setUrlParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    }
    
    /**
     * 下载文件
     * @param {string} url - 文件URL
     * @param {string} filename - 文件名
     */
    downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * 复制到剪贴板
     * @param {string} text 
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            UI.showMessage('已复制到剪贴板', 'success', 2000);
        } catch (err) {
            // fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            UI.showMessage('已复制到剪贴板', 'success', 2000);
        }
    }
    
    /**
     * 检测设备类型
     */
    getDeviceType() {
        const ua = navigator.userAgent;
        
        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            return 'tablet';
        } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
            return 'mobile';
        } else {
            return 'desktop';
        }
    }
    
    /**
     * 检测浏览器类型
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        
        if (ua.indexOf('Chrome') > -1) {
            return 'Chrome';
        } else if (ua.indexOf('Firefox') > -1) {
            return 'Firefox';
        } else if (ua.indexOf('Safari') > -1) {
            return 'Safari';
        } else if (ua.indexOf('Edge') > -1) {
            return 'Edge';
        } else if (ua.indexOf('Opera') > -1) {
            return 'Opera';
        } else {
            return 'Unknown';
        }
    }
}

// 全局工具实例
const utils = new ShopProUtils();

// 导出工具类
window.utils = utils;
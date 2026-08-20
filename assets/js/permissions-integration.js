/**
 * ShopPro 权限控制集成脚本
 * 提供RBAC权限检查、路由守卫、UI权限控制等功能
 * @version 1.0.0
 */

// ==================== 权限系统核心类 ====================

/**
 * 权限管理器类
 */
class PermissionsManager {
    constructor() {
        this.currentUser = null;
        this.permissions = [];
        this.roles = [];
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5分钟过期
        this.init();
    }

    /**
     * 初始化权限管理器
     */
    init() {
        // 从localStorage获取当前用户
        const userData = localStorage.getItem('current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.loadUserPermissions();
        }
    }

    /**
     * 加载用户权限
     */
    async loadUserPermissions() {
        try {
            if (!this.currentUser) {
                console.warn('没有登录用户');
                return;
            }

            // 使用API客户端获取权限
            const response = await window.api.permissions.roles.list({
                userId: this.currentUser.id
            });

            this.roles = response.roles || [];
            this.permissions = response.permissions || [];

            // 缓存权限
            this.setCacheData('permissions', this.permissions);

            console.log('✅ 用户权限已加载');
        } catch (error) {
            console.error('❌ 加载权限失败:', error);
        }
    }

    /**
     * 检查用户是否有特定权限
     * @param {string} permission - 权限名称
     * @returns {boolean}
     */
    hasPermission(permission) {
        if (!this.currentUser) {
            return false;
        }

        // 检查缓存
        const cacheKey = `perm_${permission}`;
        const cached = this.getCacheData(cacheKey);
        if (cached !== null) {
            return cached;
        }

        const hasIt = this.permissions.some(p => 
            p.code === permission || p.name === permission
        );

        // 缓存结果
        this.setCacheData(cacheKey, hasIt);

        return hasIt;
    }

    /**
     * 检查用户是否拥有特定角色
     * @param {string} role - 角色名称
     * @returns {boolean}
     */
    hasRole(role) {
        if (!this.currentUser) {
            return false;
        }

        return this.roles.some(r => r.code === role || r.name === role);
    }

    /**
     * 检查用户是否拥有所有权限
     * @param {Array<string>} permissions - 权限数组
     * @returns {boolean}
     */
    hasAllPermissions(permissions) {
        return permissions.every(p => this.hasPermission(p));
    }

    /**
     * 检查用户是否拥有任何一个权限
     * @param {Array<string>} permissions - 权限数组
     * @returns {boolean}
     */
    hasAnyPermission(permissions) {
        return permissions.some(p => this.hasPermission(p));
    }

    /**
     * 检查用户是否拥有所有角色
     * @param {Array<string>} roles - 角色数组
     * @returns {boolean}
     */
    hasAllRoles(roles) {
        return roles.every(r => this.hasRole(r));
    }

    /**
     * 检查用户是否拥有任何角色
     * @param {Array<string>} roles - 角色数组
     * @returns {boolean}
     */
    hasAnyRole(roles) {
        return roles.some(r => this.hasRole(r));
    }

    /**
     * 获取用户的所有权限代码
     * @returns {Array<string>}
     */
    getPermissionCodes() {
        return this.permissions.map(p => p.code);
    }

    /**
     * 获取用户的所有角色代码
     * @returns {Array<string>}
     */
    getRoleCodes() {
        return this.roles.map(r => r.code);
    }

    /**
     * 设置缓存数据
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     */
    setCacheData(key, value) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + this.cacheExpiry
        });
    }

    /**
     * 获取缓存数据
     * @param {string} key - 缓存键
     * @returns {any}
     */
    getCacheData(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }

        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }

        return cached.value;
    }

    /**
     * 清除所有缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 刷新权限
     */
    async refreshPermissions() {
        this.clearCache();
        await this.loadUserPermissions();
    }
}

// 全局权限管理器实例
const permissionsManager = new PermissionsManager();

// ==================== 路由守卫 ====================

/**
 * 路由权限守卫
 * 用于在访问页面前检查权限
 */
const routeGuard = {
    /**
     * 检查路由是否需要权限
     * @param {string} route - 路由路径
     * @param {Array<string>} requiredPermissions - 所需权限
     * @returns {boolean}
     */
    canAccess: function(route, requiredPermissions = []) {
        if (!requiredPermissions.length) {
            return true;
        }

        return permissionsManager.hasAllPermissions(requiredPermissions);
    },

    /**
     * 检查并重定向
     * @param {string} route - 路由路径
     * @param {Array<string>} requiredPermissions - 所需权限
     * @param {string} redirectTo - 重定向路径
     */
    checkAndRedirect: function(route, requiredPermissions, redirectTo = '/no-permission') {
        if (!this.canAccess(route, requiredPermissions)) {
            console.warn(`⚠️ 无权访问 ${route}，正在重定向...`);
            window.location.href = redirectTo;
            return false;
        }
        return true;
    },

    /**
     * 异步路由守卫（支持Promise）
     * @param {string} route - 路由路径
     * @param {Array<string>} requiredPermissions - 所需权限
     * @returns {Promise<boolean>}
     */
    guardAsync: async function(route, requiredPermissions) {
        try {
            // 确保权限已加载
            if (!permissionsManager.permissions.length) {
                await permissionsManager.loadUserPermissions();
            }

            return this.canAccess(route, requiredPermissions);
        } catch (error) {
            console.error('❌ 路由守卫检查失败:', error);
            return false;
        }
    }
};

// ==================== UI 权限控制 ====================

/**
 * UI权限控制工具
 */
const uiPermissions = {
    /**
     * 根据权限显示/隐藏元素
     * @param {string} selector - 选择器
     * @param {string|Array<string>} permission - 权限或权限数组
     * @param {boolean} requireAll - 是否需要所有权限
     */
    showIfPermitted: function(selector, permission, requireAll = true) {
        const elements = document.querySelectorAll(selector);
        const hasPermission = Array.isArray(permission) ?
            (requireAll ? permissionsManager.hasAllPermissions(permission) : 
                         permissionsManager.hasAnyPermission(permission)) :
            permissionsManager.hasPermission(permission);

        elements.forEach(el => {
            if (hasPermission) {
                el.classList.remove('hidden', 'opacity-0');
                el.style.display = '';
            } else {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });
    },

    /**
     * 根据权限禁用/启用按钮
     * @param {string} selector - 选择器
     * @param {string|Array<string>} permission - 权限或权限数组
     * @param {boolean} requireAll - 是否需要所有权限
     */
    enableIfPermitted: function(selector, permission, requireAll = true) {
        const elements = document.querySelectorAll(selector);
        const hasPermission = Array.isArray(permission) ?
            (requireAll ? permissionsManager.hasAllPermissions(permission) : 
                         permissionsManager.hasAnyPermission(permission)) :
            permissionsManager.hasPermission(permission);

        elements.forEach(el => {
            if (hasPermission) {
                el.disabled = false;
                el.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                el.disabled = true;
                el.classList.add('opacity-50', 'cursor-not-allowed');
                el.title = '您没有权限执行此操作';
            }
        });
    },

    /**
     * 根据权限切换元素类
     * @param {string} selector - 选择器
     * @param {string} className - 类名
     * @param {string|Array<string>} permission - 权限或权限数组
     */
    toggleClassIfPermitted: function(selector, className, permission) {
        const elements = document.querySelectorAll(selector);
        const hasPermission = Array.isArray(permission) ?
            permissionsManager.hasAnyPermission(permission) :
            permissionsManager.hasPermission(permission);

        elements.forEach(el => {
            if (hasPermission) {
                el.classList.add(className);
            } else {
                el.classList.remove(className);
            }
        });
    }
};

// ==================== 装饰器和拦截器 ====================

/**
 * 函数权限装饰器
 * @param {string|Array<string>} requiredPermissions - 所需权限
 * @param {Function} fallback - 无权限时的回调
 * @returns {Function}
 */
function requirePermission(requiredPermissions, fallback) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function(...args) {
            const hasPermission = Array.isArray(requiredPermissions) ?
                permissionsManager.hasAllPermissions(requiredPermissions) :
                permissionsManager.hasPermission(requiredPermissions);

            if (!hasPermission) {
                console.warn('⚠️ 权限不足，无法执行操作');
                if (fallback) {
                    fallback(...args);
                }
                return;
            }

            return originalMethod.apply(this, args);
        };

        return descriptor;
    };
}

/**
 * 异步权限检查
 * @param {string|Array<string>} requiredPermissions - 所需权限
 * @param {Function} fn - 要执行的函数
 * @param {Function} fallback - 无权限时的回调
 * @returns {Promise}
 */
async function withPermissionCheck(requiredPermissions, fn, fallback) {
    try {
        // 确保权限已加载
        if (!permissionsManager.permissions.length) {
            await permissionsManager.loadUserPermissions();
        }

        const hasPermission = Array.isArray(requiredPermissions) ?
            permissionsManager.hasAllPermissions(requiredPermissions) :
            permissionsManager.hasPermission(requiredPermissions);

        if (!hasPermission) {
            console.warn('⚠️ 权限不足');
            if (fallback) {
                await fallback();
            }
            return null;
        }

        return await fn();
    } catch (error) {
        console.error('❌ 权限检查出错:', error);
        return null;
    }
}

// ==================== API请求拦截 ====================

/**
 * 添加权限检查API拦截器
 */
function initPermissionInterceptors() {
    if (!window.api) {
        console.warn('⚠️ API客户端未初始化');
        return;
    }

    // 添加请求拦截器
    window.api.addRequestInterceptor(async (config) => {
        // 确保有效的权限
        if (!permissionsManager.permissions.length) {
            await permissionsManager.loadUserPermissions();
        }

        // 添加用户权限到请求头
        config.headers = config.headers || {};
        config.headers['X-User-Roles'] = permissionsManager.getRoleCodes().join(',');
        config.headers['X-User-Permissions'] = permissionsManager.getPermissionCodes().join(',');

        return config;
    });

    // 添加响应拦截器，处理403权限错误
    window.api.addResponseInterceptor(async (response) => {
        if (response.status === 403) {
            console.warn('⚠️ 权限被拒绝，请刷新权限');
            await permissionsManager.refreshPermissions();
        }

        return response;
    });
}

// ==================== 权限初始化和导出 ====================

/**
 * 初始化权限系统
 */
async function initPermissions() {
    try {
        console.log('正在初始化权限系统...');
        
        // 加载用户权限
        await permissionsManager.loadUserPermissions();
        
        // 初始化API拦截器
        initPermissionInterceptors();
        
        console.log('✅ 权限系统已初始化');
        return true;
    } catch (error) {
        console.error('❌ 权限系统初始化失败:', error);
        return false;
    }
}

/**
 * 页面加载时自动初始化权限
 */
document.addEventListener('DOMContentLoaded', async () => {
    await initPermissions();
});

// ==================== 全局导出 ====================

window.permissionsIntegration = {
    // 权限管理器
    manager: permissionsManager,

    // 路由守卫
    routeGuard,

    // UI权限控制
    ui: uiPermissions,

    // 装饰器和拦截器
    requirePermission,
    withPermissionCheck,

    // 初始化
    init: initPermissions,
    initInterceptors: initPermissionInterceptors,

    // 快速方法
    hasPermission: (p) => permissionsManager.hasPermission(p),
    hasRole: (r) => permissionsManager.hasRole(r),
    hasAllPermissions: (ps) => permissionsManager.hasAllPermissions(ps),
    hasAnyPermission: (ps) => permissionsManager.hasAnyPermission(ps),
    hasAllRoles: (rs) => permissionsManager.hasAllRoles(rs),
    hasAnyRole: (rs) => permissionsManager.hasAnyRole(rs),
    
    // 数据获取
    getCurrentUser: () => permissionsManager.currentUser,
    getPermissions: () => permissionsManager.permissions,
    getRoles: () => permissionsManager.roles,
    getPermissionCodes: () => permissionsManager.getPermissionCodes(),
    getRoleCodes: () => permissionsManager.getRoleCodes(),

    // 缓存管理
    refreshPermissions: () => permissionsManager.refreshPermissions(),
    clearCache: () => permissionsManager.clearCache()
};

console.log('💼 权限控制集成已加载');

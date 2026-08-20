/*!
 * ShopPro API Client
 * 统一的API客户端，支持RESTful接口和AI服务调用
 * @version 1.0.0
 * @author ShopPro Team
 */

class APIClient {
    constructor() {
        // 支持通过全局变量或 localStorage 覆盖后端地址
        const globalApiBase = (window.API_BASE_URL || localStorage.getItem('API_BASE_URL') || '').trim();
        const globalApiURL = (window.API_URL || localStorage.getItem('API_URL') || '').trim();
        const globalAiURL = (window.AI_API_URL || window.AI_URL || localStorage.getItem('AI_API_URL') || localStorage.getItem('AI_URL') || '').trim();

        this.baseURL = (globalApiBase || window.location.origin).replace(/\/+$/, '');
        this.apiURL = (globalApiURL || `${this.baseURL}/api`).replace(/\/+$/, '');
        this.aiURL = (globalAiURL || 'http://localhost:5000/api').replace(/\/+$/, ''); // AI服务地址
        
        // 默认配置
        this.config = {
            timeout: 30000,
            retries: 3,
            retryDelay: 1000
        };
        
        // 请求拦截器
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        
        // 初始化
        this.init();
    }

    init() {
    // 设置默认请求头
    this.defaultHeaders = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
    
    // 从localStorage获取token
    const token = localStorage.getItem('auth_token');
    if (token) {
        this.setAuthToken(token);
    }
}

/**
 * 设置认证Token
 * @param {string} token 
 */
setAuthToken(token) {
    if (token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('auth_token', token);
    } else {
        delete this.defaultHeaders['Authorization'];
        localStorage.removeItem('auth_token');
    }
}

/**
 * 添加请求拦截器
 * @param {Function} interceptor 
 */
addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
}

/**
 * 添加响应拦截器
 * @param {Function} interceptor 
 */
addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
}

/**
 * 处理请求拦截器
 * @param {Object} config 
 */
async processRequestInterceptors(config) {
    for (const interceptor of this.requestInterceptors) {
        config = await interceptor(config);
    }
    return config;
}

/**
 * 处理响应拦截器
 * @param {Object} response 
 */
async processResponseInterceptors(response) {
    for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
    }
    return response;
}

/**
 * 基础HTTP请求方法
 * @param {string} url 
 * @param {Object} options 
 */
async request(url, options = {}) {
    // 合并配置
    const config = {
        method: 'GET',
        headers: { ...this.defaultHeaders },
        ...options
    };
    
    // 处理请求拦截器
    await this.processRequestInterceptors(config);
    
    // 显示加载动画
    if (config.showLoading !== false) {
        UI.showLoading();
    }
    
    try {
        // 重试机制
        let lastError;
        for (let i = 0; i < this.config.retries; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                    
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                    
                clearTimeout(timeoutId);
                    
                // 处理HTTP错误状态
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const error = new APIError(response.status, errorData.message || response.statusText, errorData);
                    throw error;
                }
                    
                // 解析响应数据
                const data = await response.json();
                    
                // 处理响应拦截器
                const processedResponse = await this.processResponseInterceptors({
                    data,
                    status: response.status,
                    headers: response.headers
                });
                    
                return processedResponse.data;
                    
            } catch (error) {
                lastError = error;
                
                // 分类错误并决定是否重试
                const classification = ErrorHandler?.classify(error);
                const isRetryable = classification?.retryable && i < this.config.retries - 1;
                
                // 如果不可重试或已达到最大重试次数，处理错误并抛出
                if (!isRetryable) {
                    // 使用ErrorHandler处理错误
                    if (ErrorHandler) {
                        ErrorHandler.handle(error, {
                            url: url,
                            method: config.method,
                            attempt: i + 1,
                            totalAttempts: this.config.retries,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.error('API Request Error:', error);
                    }
                    throw error;
                }
                    
                // 等待后重试（指数退避）
                const waitTime = this.config.retryDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        throw lastError;
            
    } finally {
        // 隐藏加载动画
        if (config.showLoading !== false) {
            UI.hideLoading();
        }
    }
}

/**
 * GET请求
 */
async get(url, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullURL = queryString ? `${url}?${queryString}` : url;
    
    return this.request(fullURL, {
        method: 'GET',
        ...options
    });
}

/**
 * POST请求
 */
async post(url, data = {}, options = {}) {
    return this.request(url, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
    });
}

/**
 * PUT请求
 */
async put(url, data = {}, options = {}) {
    return this.request(url, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    });
}

/**
 * DELETE请求
 */
async delete(url, options = {}) {
    return this.request(url, {
        method: 'DELETE',
        ...options
    });
}

// ========== 业务API方法 ==========

/**
 * 用户认证相关API
 */
auth = {
    login: (credentials) => this.post(`${this.apiURL}/auth/login`, credentials),
    logout: () => this.post(`${this.apiURL}/auth/logout`),
    register: (userData) => this.post(`${this.apiURL}/auth/register`, userData),
    refreshToken: () => this.post(`${this.apiURL}/auth/refresh`),
    getCurrentUser: () => this.get(`${this.apiURL}/auth/me`)
};

/**
 * 客户管理API
 */
customers = {
    list: (params) => this.get(`${this.apiURL}/customers`, params),
    get: (id) => this.get(`${this.apiURL}/customers/${id}`),
    create: (data) => this.post(`${this.apiURL}/customers`, data),
    update: (id, data) => this.put(`${this.apiURL}/customers/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/customers/${id}`),
    search: (query) => this.get(`${this.apiURL}/customers/search`, { q: query }),
    assign: (id, userId) => this.post(`${this.apiURL}/customers/${id}/assign`, { assignedTo: userId }),
    getStats: () => this.get(`${this.apiURL}/customers/stats`),
    upgradeLVIP: (id) => this.post(`${this.apiURL}/customers/${id}/upgrade`),
    markLost: (id) => this.post(`${this.apiURL}/customers/${id}/lost`),
    recover: (id) => this.post(`${this.apiURL}/customers/${id}/recover`)
};

/**
 * 线索管理API
 */
leads = {
    list: (params) => this.get(`${this.apiURL}/leads`, params),
    get: (id) => this.get(`${this.apiURL}/leads/${id}`),
    create: (data) => this.post(`${this.apiURL}/leads`, data),
    update: (id, data) => this.put(`${this.apiURL}/leads/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/leads/${id}`),
    convert: (id, customerData) => this.post(`${this.apiURL}/leads/${id}/convert`, customerData),
    assign: (id, userId) => this.post(`${this.apiURL}/leads/${id}/assign`, { assignedTo: userId }),
    updateStatus: (id, status) => this.post(`${this.apiURL}/leads/${id}/status`, { status }),
    getStats: () => this.get(`${this.apiURL}/leads/stats`),
    search: (query) => this.get(`${this.apiURL}/leads/search`, { q: query })
};

/**
 * 跟进记录API
 */
followUps = {
    list: (params) => this.get(`${this.apiURL}/follow-ups`, params),
    create: (data) => this.post(`${this.apiURL}/follow-ups`, data),
    update: (id, data) => this.put(`${this.apiURL}/follow-ups/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/follow-ups/${id}`),
    getReminders: () => this.get(`${this.apiURL}/follow-ups/reminders`),
    getOverdue: () => this.get(`${this.apiURL}/follow-ups/overdue`),
    getStats: () => this.get(`${this.apiURL}/follow-ups/stats`)
};

/**
 * 产品管理API
 */
products = {
    list: (params) => this.get(`${this.apiURL}/products`, params),
    get: (id) => this.get(`${this.apiURL}/products/${id}`),
    create: (data) => this.post(`${this.apiURL}/products`, data),
    update: (id, data) => this.put(`${this.apiURL}/products/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/products/${id}`),
    search: (query) => this.get(`${this.apiURL}/products/search`, { q: query }),
    getByCategory: (categoryId, params) => this.get(`${this.apiURL}/products/category/${categoryId}`, params),
    updateStock: (id, quantity) => this.post(`${this.apiURL}/products/${id}/stock`, { quantity }),
    getStats: () => this.get(`${this.apiURL}/products/stats`)
};

/**
 * 产品分类API
 */
productCategories = {
    list: (params) => this.get(`${this.apiURL}/product-categories`, params),
    get: (id) => this.get(`${this.apiURL}/product-categories/${id}`),
    create: (data) => this.post(`${this.apiURL}/product-categories`, data),
    update: (id, data) => this.put(`${this.apiURL}/product-categories/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/product-categories/${id}`),
    getTree: () => this.get(`${this.apiURL}/product-categories/tree`),
    getChildren: (parentId) => this.get(`${this.apiURL}/product-categories/${parentId}/children`)
};

/**
 * 知识库API
 */
knowledge = {
    list: (params) => this.get(`${this.apiURL}/knowledge`, params),
    get: (id) => this.get(`${this.apiURL}/knowledge/${id}`),
    create: (data) => this.post(`${this.apiURL}/knowledge`, data),
    update: (id, data) => this.put(`${this.apiURL}/knowledge/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/knowledge/${id}`),
    search: (query) => this.get(`${this.apiURL}/knowledge/search`, { q: query }),
    getFeatured: (limit) => this.get(`${this.apiURL}/knowledge/featured`, { limit }),
    getHot: (limit) => this.get(`${this.apiURL}/knowledge/hot`, { limit }),
    like: (id) => this.post(`${this.apiURL}/knowledge/${id}/like`),
    getByCategory: (categoryId, params) => this.get(`${this.apiURL}/knowledge/category/${categoryId}`, params)
};

/**
 * 知识库分类API
 */
knowledgeCategories = {
    list: (params) => this.get(`${this.apiURL}/knowledge-categories`, params),
    get: (id) => this.get(`${this.apiURL}/knowledge-categories/${id}`),
    create: (data) => this.post(`${this.apiURL}/knowledge-categories`, data),
    update: (id, data) => this.put(`${this.apiURL}/knowledge-categories/${id}`, data),
    delete: (id) => this.delete(`${this.apiURL}/knowledge-categories/${id}`),
    getTree: () => this.get(`${this.apiURL}/knowledge-categories/tree`)
};

/**
 * 文件管理API
 */
files = {
    upload: (file, entityType, entityId) => {
        const formData = new FormData();
        formData.append('file', file);
        if (entityType) formData.append('relatedEntityType', entityType);
        if (entityId) formData.append('relatedEntityId', entityId);
        return this.post(`${this.apiURL}/files/upload`, formData, { 
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    uploadBatch: (files, entityType, entityId) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        if (entityType) formData.append('relatedEntityType', entityType);
        if (entityId) formData.append('relatedEntityId', entityId);
        return this.post(`${this.apiURL}/files/upload-batch`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    download: (fileId) => window.location.href = `${this.apiURL}/files/download/${fileId}`,
    getInfo: (fileId) => this.get(`${this.apiURL}/files/${fileId}`),
    delete: (fileId) => this.delete(`${this.apiURL}/files/${fileId}`),
    deleteBatch: (fileIds) => this.delete(`${this.apiURL}/files/batch-delete`, { fileIds }),
    getByEntity: (entityType, entityId) => this.get(`${this.apiURL}/files/entity/${entityType}/${entityId}`)
};

/**
 * 数据分析API
 */
analytics = {
    getDashboard: () => this.get(`${this.apiURL}/analytics/dashboard`),
    getSalesAnalysis: (params) => this.get(`${this.apiURL}/analytics/sales`, params),
    getCustomerAnalysis: (params) => this.get(`${this.apiURL}/analytics/customer`, params),
    getProductAnalysis: (params) => this.get(`${this.apiURL}/analytics/product`, params),
    getSalesForecast: (params) => this.get(`${this.apiURL}/analytics/forecast/sales`, params),
    getChurnPrediction: (params) => this.get(`${this.apiURL}/analytics/forecast/churn`, params),
    getConversionRate: (params) => this.get(`${this.apiURL}/analytics/conversion-rate`, params),
    getComparison: (params) => this.get(`${this.apiURL}/analytics/comparison`, params),
    generateReport: (reportType) => this.get(`${this.apiURL}/analytics/report/${reportType}`)
};

/**
 * 权限管理API
 */
permissions = {
    roles: {
        list: (params) => this.get(`${this.apiURL}/permissions/roles`, params),
        get: (id) => this.get(`${this.apiURL}/permissions/roles/${id}`),
        create: (data) => this.post(`${this.apiURL}/permissions/roles`, data),
        update: (id, data) => this.put(`${this.apiURL}/permissions/roles/${id}`, data),
        delete: (id) => this.delete(`${this.apiURL}/permissions/roles/${id}`)
    },
    permissions: {
        list: (params) => this.get(`${this.apiURL}/permissions/perms`, params),
        get: (id) => this.get(`${this.apiURL}/permissions/perms/${id}`),
        create: (data) => this.post(`${this.apiURL}/permissions/perms`, data),
        update: (id, data) => this.put(`${this.apiURL}/permissions/perms/${id}`, data),
        delete: (id) => this.delete(`${this.apiURL}/permissions/perms/${id}`)
    },
    departments: {
        list: (params) => this.get(`${this.apiURL}/permissions/departments`, params),
        get: (id) => this.get(`${this.apiURL}/permissions/departments/${id}`),
        create: (data) => this.post(`${this.apiURL}/permissions/departments`, data),
        update: (id, data) => this.put(`${this.apiURL}/permissions/departments/${id}`, data),
        delete: (id) => this.delete(`${this.apiURL}/permissions/departments/${id}`),
        getTree: () => this.get(`${this.apiURL}/permissions/departments/tree`)
    },
    // 新增：查询与校验接口联调方法
    queries: {
        listEnabled: (params = {}) => this.get(`${this.apiURL}/permissions/enabled`, params),
        listResources: () => this.get(`${this.apiURL}/permissions/resources`),
        countEnabled: () => this.get(`${this.apiURL}/permissions/count/enabled`),
        byUser: (userId) => this.get(`${this.apiURL}/permissions/user/${userId}`),
        byRole: (roleId) => this.get(`${this.apiURL}/permissions/role/${roleId}`),
        byResource: (resource) => this.get(`${this.apiURL}/permissions/resource/${resource}`),
        byCode: (code) => this.get(`${this.apiURL}/permissions/code/${code}`)
    },
    checks: {
        checkUserPermission: (userId, permissionCode) => this.get(`${this.apiURL}/permissions/user/${userId}/check/${permissionCode}`),
        batchCheckUserPermissions: (userId, codes = []) => this.post(`${this.apiURL}/permissions/user/${userId}/batch-check`, { codes })
    }
};

/**
 * 第三方集成API
 */
integrations = {
    wecom: {
        sendMessage: (data) => this.post(`${this.apiURL}/integrations/wecom/send`, data),
        syncUsers: () => this.post(`${this.apiURL}/integrations/wecom/sync-users`),
        syncDepartments: () => this.post(`${this.apiURL}/integrations/wecom/sync-departments`),
        getConfig: () => this.get(`${this.apiURL}/integrations/wecom/config`)
    },
    dingtalk: {
        sendMessage: (data) => this.post(`${this.apiURL}/integrations/dingtalk/send`, data),
        syncUsers: () => this.post(`${this.apiURL}/integrations/dingtalk/sync-users`),
        syncDepartments: () => this.post(`${this.apiURL}/integrations/dingtalk/sync-departments`),
        getConfig: () => this.get(`${this.apiURL}/integrations/dingtalk/config`)
    },
    sms: {
        send: (data) => this.post(`${this.apiURL}/integrations/sms/send`, data),
        getConfig: () => this.get(`${this.apiURL}/integrations/sms/config`)
    },
    email: {
        send: (data) => this.post(`${this.apiURL}/integrations/email/send`, data),
        getConfig: () => this.get(`${this.apiURL}/integrations/email/config`)
    },
    payment: {
        initiate: (data) => this.post(`${this.apiURL}/integrations/payment/initiate`, data),
        verify: (data) => this.post(`${this.apiURL}/integrations/payment/verify`, data),
        getConfig: () => this.get(`${this.apiURL}/integrations/payment/config`)
    }
};

// ========== AI服务API ==========

/**
 * AI客户分析API
 */
aiCustomer = {
    analyze: (customerId) => this.post(`${this.aiURL}/customer/analysis`, { customer_id: customerId }),
    getAnalysis: (customerId) => this.get(`${this.aiURL}/customer/analysis/${customerId}`)
};

/**
 * AI销售预测API
 */
aiSales = {
    predict: (leadId) => this.post(`${this.aiURL}/sales/prediction`, { lead_id: leadId }),
    batchPredict: (leadIds) => this.post(`${this.aiURL}/batch/analysis`, {
        type: 'sales',
        entity_ids: leadIds
    })
};

/**
 * AI话术推荐API
 */
aiScript = {
    recommend: (customerId, scenario = 'general') => this.post(`${this.aiURL}/script/recommendation`, {
        customer_id: customerId,
        scenario: scenario
    })
};

/**
 * AI风险分析API
 */
aiRisk = {
    analyze: (customerIds) => this.post(`${this.aiURL}/risk/analysis`, {
        customer_ids: customerIds
    })
};

/**
 * 高级AI算法API
 */
aiAdvanced = {
    // 客户生命周期价值预测
    predictCLV: (customers) => this.post(`${this.aiURL}/advanced/clv_prediction`, {
        customers: customers
    }),
    
    // 销售漏斗分析
    analyzeFunnel: (funnelData) => this.post(`${this.aiURL}/advanced/funnel_analysis`, {
        funnel_data: funnelData
    }),
    
    // 高级客户细分
    segmentCustomers: (customers) => this.post(`${this.aiURL}/advanced/customer_segmentation`, {
        customers: customers
    }),
    
    // 实时个性化推荐
    getRecommendations: (userId, itemType = 'product', count = 10, interactions = []) => 
        this.post(`${this.aiURL}/advanced/recommendations`, {
            user_id: userId,
            item_type: itemType,
            count: count,
            interactions: interactions
        }),
    
    // 更新用户画像
    updateUserProfile: (userId, interactions) => this.post(`${this.aiURL}/advanced/user_profile`, {
        user_id: userId,
        interactions: interactions
    }),
    
    // 训练CLV模型
    trainCLVModel: (trainingData) => this.post(`${this.aiURL}/advanced/batch_clv_training`, {
        training_data: trainingData
    })
};

/**
 * 智能营销自动化API
 */
aiMarketing = {
    // 客户旅程管理
    createJourney: (journeyConfig) => this.post(`${this.aiURL}/marketing/journey/create`, {
        journey_config: journeyConfig
    }),

    triggerJourney: (customerId, journeyId, triggerEvent = {}) => this.post(`${this.aiURL}/marketing/journey/trigger`, {
        customer_id: customerId,
        journey_id: journeyId,
        trigger_event: triggerEvent
    }),

    // 个性化营销活动
    createCampaign: (campaignConfig) => this.post(`${this.aiURL}/marketing/campaign/create`, {
        campaign_config: campaignConfig
    }),

    personalizeCampaign: (customerId, campaignId) => this.post(`${this.aiURL}/marketing/campaign/personalize`, {
        customer_id: customerId,
        campaign_id: campaignId
    }),

    // 智能邮件营销
    sendSmartEmail: (emailConfig, recipients) => this.post(`${this.aiURL}/marketing/email/send`, {
        email_config: emailConfig,
        recipients: recipients
    }),

    optimizeSendTiming: (recipients) => this.post(`${this.aiURL}/marketing/email/optimize_timing`, {
        recipients: recipients
    }),

    predictEmailMetrics: (emailContent, recipientSegments) => this.post(`${this.aiURL}/marketing/email/predict_metrics`, {
        email_content: emailContent,
        recipient_segments: recipientSegments
    })
};

/**
 * 高级报表和分析API
 */
aiAnalytics = {
    // 数据透视分析
    createPivotAnalysis: (data, config) => this.post(`${this.aiURL}/analytics/pivot`, {
        data: data,
        config: config
    }),
    
    // 自定义报表生成
    generateCustomReport: (config, data) => this.post(`${this.aiURL}/analytics/report/generate`, {
        config: config,
        data: data
    }),
    
    // 异常检测
    detectAnomalies: (data, config) => this.post(`${this.aiURL}/analytics/anomaly/detect`, {
        data: data,
        config: config
    }),
    
    // 趋势预测
    predictTrends: (data, config) => this.post(`${this.aiURL}/analytics/trend/predict`, {
        data: data,
        config: config
    }),
    
    // 竞争对手分析
    analyzeCompetitors: (companyData, competitorData, config = {}) => this.post(`${this.aiURL}/analytics/competitor/analyze`, {
        company_data: companyData,
        competitor_data: competitorData,
        config: config
    }),
    
    // 获取报表模板
    getReportTemplates: () => this.get(`${this.aiURL}/analytics/templates`)
};

/**
 * AI健康检查
 */
aiHealth() {
    return this.get(`${this.aiURL}/health`);
}

/**
 * 聊天机器人与知识库API
 */
chat = {
    // 发送聊天消息
    sendMessage: ({ userId, sessionId, message, channel = 'web', context = {} }) =>
        this.post(`${this.aiURL}/chat/message`, {
            user_id: userId,
            session_id: sessionId,
            message: message,
            channel: channel,
            context: context
        }),

    // 获取会话详情/历史
    getSession: (sessionId) => this.get(`${this.aiURL}/chat/session/${sessionId}`),

    // 结束会话
    endSession: (sessionId) => this.post(`${this.aiURL}/chat/session/${sessionId}/end`, {}),

    // 知识库搜索
    knowledgeSearch: (query, limit = 10) => this.post(`${this.aiURL}/chat/knowledge/search`, {
        query,
        limit
    }),

    // 批量更新知识库（FAQ等），参数为数组：[{question, answer}, ...]
    updateKnowledge: (knowledgeItems) => this.post(`${this.aiURL}/chat/knowledge`, {
        knowledge_items: knowledgeItems
    })
};
}

/**
 * API错误类
 */
class APIError extends Error {
    constructor(status, message, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
    
    /**
     * 是否为网络错误
     */
    isNetworkError() {
        return this.status === 0;
    }
    
    /**
     * 是否为认证错误
     */
    isAuthError() {
        return this.status === 401;
    }
    
    /**
     * 是否为权限错误
     */
    isForbiddenError() {
        return this.status === 403;
    }
    
    /**
     * 是否为服务器错误
     */
    isServerError() {
        return this.status >= 500;
    }
}

// 全局API客户端实例
const api = new APIClient();

// 添加默认错误处理拦截器
api.addResponseInterceptor(async (response) => {
    // 处理认证错误
    if (response.status === 401) {
        // 清除认证信息
        api.setAuthToken(null);
        // 重定向到登录页面
        if (window.location.pathname !== '/pages/login.html') {
            UI.showMessage('登录已过期，请重新登录', 'warning');
            setTimeout(() => {
                window.location.href = '/pages/login.html';
            }, 2000);
        }
    }
    
    return response;
});

// 导出API客户端
window.api = api;
window.APIError = APIError;
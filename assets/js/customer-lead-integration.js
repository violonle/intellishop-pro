/**
 * ShopPro 客户和线索管理前后端集成脚本
 * 提供所有客户和线索相关的API包装函数
 * @version 1.0.0
 */

// ==================== 客户管理 API ====================

/**
 * 加载客户列表
 * @param {string} filter - 筛选条件：all|vip|high-value|active|dormant
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码，默认为1
 * @returns {Promise<Object>} 包含customers数组、total总数、分页信息
 */
async function loadCustomers(filter = 'all', keyword = '', page = 1) {
    try {
        const params = {
            pageNo: page,
            pageSize: 10
        };

        // 应用筛选条件
        if (filter === 'vip') {
            params.level = 'vip';
        } else if (filter === 'high-value') {
            params.level = 'diamond';
        } else if (filter === 'active') {
            params.status = 'active';
        } else if (filter === 'dormant') {
            params.status = 'inactive';
        }

        // 如果有搜索关键词，使用搜索API
        if (keyword.trim()) {
            const response = await window.api.customers.search(keyword, page);
            return {
                customers: response.data || [],
                total: response.total || 0,
                pageNo: page,
                pageSize: 10
            };
        }

        // 否则使用列表API
        const response = await window.api.customers.list(params);
        return {
            customers: response.records || [],
            total: response.total || 0,
            pageNo: page,
            pageSize: 10
        };
    } catch (error) {
        console.error('加载客户列表失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('加载客户列表失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 获取客户详情
 * @param {number} customerId - 客户ID
 * @returns {Promise<Object>} 客户详细信息
 */
async function getCustomerDetail(customerId) {
    try {
        const response = await window.api.customers.get(customerId);
        return response || null;
    } catch (error) {
        console.error('获取客户详情失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('获取客户详情失败', 'danger');
        }
        return null;
    }
}

/**
 * 创建新客户
 * @param {Object} customerData - 客户信息
 * @returns {Promise<Object>} 创建后的客户对象
 */
async function createCustomer(customerData) {
    try {
        // 验证必填字段
        if (!customerData.realName || !customerData.phone) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('请填写客户名称和手机号', 'warning');
            }
            return null;
        }

        const response = await window.api.customers.create(customerData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('客户创建成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('创建客户失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('创建客户失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 更新客户信息
 * @param {number} customerId - 客户ID
 * @param {Object} updateData - 需要更新的数据
 * @returns {Promise<Object>} 更新后的客户对象
 */
async function updateCustomer(customerId, updateData) {
    try {
        const response = await window.api.customers.update(customerId, updateData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('客户信息更新成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('更新客户失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('更新客户失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 删除客户
 * @param {number} customerId - 客户ID
 * @param {boolean} confirm - 是否需要确认对话框
 * @returns {Promise<boolean>} 删除是否成功
 */
async function deleteCustomer(customerId, confirm = true) {
    try {
        // 显示确认对话框
        if (confirm) {
            const confirmed = window.confirm('确定要删除这个客户吗？此操作无法撤销。');
            if (!confirmed) {
                return false;
            }
        }

        await window.api.customers.delete(customerId);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('客户删除成功', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('删除客户失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('删除客户失败：' + (error.message || '未知错误'), 'danger');
        }
        return false;
    }
}

/**
 * 分配客户给销售人员
 * @param {number} customerId - 客户ID
 * @param {number} assignedUserId - 要分配给的用户ID
 * @returns {Promise<Object>} 分配结果
 */
async function assignCustomer(customerId, assignedUserId) {
    try {
        const response = await window.api.customers.update(customerId, {
            assignedTo: assignedUserId
        });
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('客户分配成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('分配客户失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('分配客户失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 获取客户统计信息
 * @returns {Promise<Object>} 统计数据
 */
async function getCustomerStatistics() {
    try {
        const params = {
            pageNo: 1,
            pageSize: 1000
        };
        const response = await window.api.customers.list(params);
        
        // 进行客户端统计
        const customers = response.records || [];
        const stats = {
            total: response.total || 0,
            vipCount: customers.filter(c => c.level === 'vip').length,
            diamondCount: customers.filter(c => c.level === 'diamond').length,
            activeCount: customers.filter(c => c.status === 'active').length,
            inactiveCount: customers.filter(c => c.status === 'inactive').length
        };
        
        return stats;
    } catch (error) {
        console.error('获取客户统计失败:', error);
        return null;
    }
}

// ==================== 线索管理 API ====================

/**
 * 加载线索列表
 * @param {string} filter - 筛选条件：all|new|contacted|qualified|proposal|negotiation|won|lost
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码，默认为1
 * @returns {Promise<Object>} 包含leads数组、total总数、分页信息
 */
async function loadLeads(filter = 'all', keyword = '', page = 1) {
    try {
        const params = {
            pageNo: page,
            pageSize: 10
        };

        // 应用筛选条件
        if (filter !== 'all') {
            params.status = filter;
        }

        // 如果有搜索关键词，使用搜索API
        if (keyword.trim()) {
            const response = await window.api.leads.search(keyword, page);
            return {
                leads: response.data || [],
                total: response.total || 0,
                pageNo: page,
                pageSize: 10
            };
        }

        // 否则使用列表API
        const response = await window.api.leads.list(params);
        return {
            leads: response.records || [],
            total: response.total || 0,
            pageNo: page,
            pageSize: 10
        };
    } catch (error) {
        console.error('加载线索列表失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('加载线索列表失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 获取线索详情
 * @param {number} leadId - 线索ID
 * @returns {Promise<Object>} 线索详细信息
 */
async function getLeadDetail(leadId) {
    try {
        const response = await window.api.leads.get(leadId);
        return response || null;
    } catch (error) {
        console.error('获取线索详情失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('获取线索详情失败', 'danger');
        }
        return null;
    }
}

/**
 * 创建新线索
 * @param {Object} leadData - 线索信息
 * @returns {Promise<Object>} 创建后的线索对象
 */
async function createLead(leadData) {
    try {
        // 验证必填字段
        if (!leadData.title) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('请填写线索标题', 'warning');
            }
            return null;
        }

        const response = await window.api.leads.create(leadData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('线索创建成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('创建线索失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('创建线索失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 更新线索信息
 * @param {number} leadId - 线索ID
 * @param {Object} updateData - 需要更新的数据
 * @returns {Promise<Object>} 更新后的线索对象
 */
async function updateLead(leadId, updateData) {
    try {
        const response = await window.api.leads.update(leadId, updateData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('线索信息更新成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('更新线索失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('更新线索失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 删除线索
 * @param {number} leadId - 线索ID
 * @param {boolean} confirm - 是否需要确认对话框
 * @returns {Promise<boolean>} 删除是否成功
 */
async function deleteLead(leadId, confirm = true) {
    try {
        if (confirm) {
            const confirmed = window.confirm('确定要删除这个线索吗？此操作无法撤销。');
            if (!confirmed) {
                return false;
            }
        }

        await window.api.leads.delete(leadId);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('线索删除成功', 'success');
        }
        
        return true;
    } catch (error) {
        console.error('删除线索失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('删除线索失败：' + (error.message || '未知错误'), 'danger');
        }
        return false;
    }
}

/**
 * 分配线索给销售人员
 * @param {number} leadId - 线索ID
 * @param {number} assignedUserId - 要分配给的用户ID
 * @returns {Promise<Object>} 分配结果
 */
async function assignLead(leadId, assignedUserId) {
    try {
        const response = await window.api.leads.update(leadId, {
            assignedTo: assignedUserId
        });
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('线索分配成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('分配线索失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('分配线索失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 线索转换为客户
 * @param {number} leadId - 线索ID
 * @param {Object} customerData - 转换为客户时的信息
 * @returns {Promise<Object>} 转换后的客户对象
 */
async function convertLeadToCustomer(leadId, customerData) {
    try {
        // 验证必填字段
        if (!customerData.realName || !customerData.phone) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('请填写客户名称和手机号', 'warning');
            }
            return null;
        }

        const response = await window.api.leads.convert(leadId, customerData);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('线索已成功转换为客户', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('线索转换失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('线索转换失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

/**
 * 获取线索统计信息
 * @returns {Promise<Object>} 统计数据
 */
async function getLeadStatistics() {
    try {
        const params = {
            pageNo: 1,
            pageSize: 1000
        };
        const response = await window.api.leads.list(params);
        
        // 进行客户端统计
        const leads = response.records || [];
        const stats = {
            total: response.total || 0,
            newCount: leads.filter(l => l.status === 'new').length,
            contactedCount: leads.filter(l => l.status === 'contacted').length,
            qualifiedCount: leads.filter(l => l.status === 'qualified').length,
            proposalCount: leads.filter(l => l.status === 'proposal').length,
            negotiationCount: leads.filter(l => l.status === 'negotiation').length,
            wonCount: leads.filter(l => l.status === 'won').length,
            lostCount: leads.filter(l => l.status === 'lost').length,
            totalValue: leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
        };
        
        return stats;
    } catch (error) {
        console.error('获取线索统计失败:', error);
        return null;
    }
}

// ==================== 辅助函数 ====================

/**
 * 隐藏电话号码（保留前3位和后4位）
 * @param {string} phone - 电话号码
 * @returns {string} 隐藏后的电话号码
 */
function maskPhone(phone) {
    if (!phone || phone.length < 7) return phone;
    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
}

/**
 * 格式化日期为相对时间
 * @param {string} dateString - ISO格式的日期字符串
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return diffMins + '分钟前';
    if (diffHours < 24) return diffHours + '小时前';
    if (diffDays < 1) return '今天';
    if (diffDays < 7) return diffDays + '天前';
    if (diffDays < 30) return Math.floor(diffDays / 7) + '周前';
    if (diffDays < 365) return Math.floor(diffDays / 30) + '月前';
    
    return date.toLocaleDateString('zh-CN');
}

/**
 * 获取客户等级标签
 * @param {string} level - 等级代码
 * @returns {string} 等级显示文本
 */
function getLevelLabel(level) {
    const labels = {
        'normal': '普通',
        'vip': 'VIP',
        'diamond': '钻石'
    };
    return labels[level] || level;
}

/**
 * 获取客户等级背景色类名
 * @param {string} level - 等级代码
 * @returns {string} CSS类名
 */
function getLevelBgClass(level) {
    const classes = {
        'normal': 'bg-gray-100 text-gray-800',
        'vip': 'bg-blue-100 text-blue-800',
        'diamond': 'bg-purple-100 text-purple-800'
    };
    return classes[level] || 'bg-gray-100 text-gray-800';
}

/**
 * 获取客户状态标签
 * @param {string} status - 状态代码
 * @returns {string} 状态显示文本
 */
function getStatusLabel(status) {
    const labels = {
        'active': '活跃',
        'inactive': '沉睡',
        'potential': '潜在',
        'lost': '已流失'
    };
    return labels[status] || status;
}

/**
 * 获取客户状态背景色类名
 * @param {string} status - 状态代码
 * @returns {string} CSS类名
 */
function getStatusBgClass(status) {
    const classes = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-yellow-100 text-yellow-800',
        'potential': 'bg-blue-100 text-blue-800',
        'lost': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

/**
 * 获取线索优先级标签
 * @param {string} priority - 优先级代码
 * @returns {string} 优先级显示文本
 */
function getPriorityLabel(priority) {
    const labels = {
        'urgent': '紧急',
        'high': '高',
        'medium': '中',
        'low': '低'
    };
    return labels[priority] || priority;
}

/**
 * 获取线索优先级背景色类名
 * @param {string} priority - 优先级代码
 * @returns {string} CSS类名
 */
function getPriorityBgClass(priority) {
    const classes = {
        'urgent': 'bg-red-100 text-red-800',
        'high': 'bg-orange-100 text-orange-800',
        'medium': 'bg-yellow-100 text-yellow-800',
        'low': 'bg-blue-100 text-blue-800'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
}

/**
 * 获取线索状态标签
 * @param {string} status - 状态代码
 * @returns {string} 状态显示文本
 */
function getLeadStatusLabel(status) {
    const labels = {
        'new': '新线索',
        'contacted': '已接触',
        'qualified': '已认证',
        'proposal': '已报价',
        'negotiation': '洽谈中',
        'won': '已成交',
        'lost': '已失败'
    };
    return labels[status] || status;
}

/**
 * 获取线索状态背景色类名
 * @param {string} status - 状态代码
 * @returns {string} CSS类名
 */
function getLeadStatusBgClass(status) {
    const classes = {
        'new': 'bg-blue-100 text-blue-800',
        'contacted': 'bg-cyan-100 text-cyan-800',
        'qualified': 'bg-indigo-100 text-indigo-800',
        'proposal': 'bg-purple-100 text-purple-800',
        'negotiation': 'bg-yellow-100 text-yellow-800',
        'won': 'bg-green-100 text-green-800',
        'lost': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

/**
 * 获取跟进方式标签
 * @param {string} type - 跟进方式代码
 * @returns {string} 跟进方式显示文本
 */
function getFollowUpTypeLabel(type) {
    const labels = {
        'call': '电话',
        'email': '邮件',
        'wechat': '微信',
        'visit': '拜访',
        'sms': '短信',
        'douyin': '抖音',
        'other': '其他'
    };
    return labels[type] || type;
}

/**
 * 格式化货币
 * @param {number} amount - 金额
 * @returns {string} 格式化后的货币字符串
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') return '-';
    return '¥' + amount.toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * 获取百分比显示
 * @param {number} value - 数值（0-100）
 * @returns {string} 百分比字符串
 */
function formatPercentage(value) {
    if (typeof value !== 'number') return '-';
    return Math.round(value) + '%';
}

// 导出到全局作用域，使其可在HTML中直接调用
window.CustomerLeadIntegration = {
    // 客户函数
    loadCustomers,
    getCustomerDetail,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    assignCustomer,
    getCustomerStatistics,
    
    // 线索函数
    loadLeads,
    getLeadDetail,
    createLead,
    updateLead,
    deleteLead,
    assignLead,
    convertLeadToCustomer,
    getLeadStatistics,
    
    // 辅助函数
    maskPhone,
    formatDate,
    getLevelLabel,
    getLevelBgClass,
    getStatusLabel,
    getStatusBgClass,
    getPriorityLabel,
    getPriorityBgClass,
    getLeadStatusLabel,
    getLeadStatusBgClass,
    getFollowUpTypeLabel,
    formatCurrency,
    formatPercentage
};

console.log('✅ 客户和线索集成模块已加载');

/**\n * 客户和线索管理前后端集成脚本\n * 提供客户列表、线索列表、详情等页面的API集成功能\n */\n\n// 全局变量\nlet currentPage = 1;\nlet pageSize = 10;\nlet currentFilter = 'all';\nlet searchKeyword = '';\nlet customerList = [];\nlet leadList = [];\nlet totalCount = 0;\n\n// ========== 客户管理API集成 ==========\n\n/**\n * 加载客户列表\n */\nasync function loadCustomers(filter = 'all', keyword = '', page = 1) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('加载客户列表...');\n        }\n        \n        let params = {\n            pageNo: page,\n            pageSize: pageSize\n        };\n        \n        // 根据过滤条件添加参数\n        if (filter && filter !== 'all') {\n            if (filter === 'vip') {\n                params.level = 'vip';\n            } else if (filter === 'high-value') {\n                params.level = 'diamond';\n            } else if (filter === 'active') {\n                params.status = 'active';\n            } else if (filter === 'dormant' || filter === 'dormant') {\n                params.status = 'inactive';\n            }\n        }\n        \n        // 添加搜索关键词\n        if (keyword) {\n            params.keyword = keyword;\n        }\n        \n        const response = await window.api.customers.list(params);\n        \n        if (response && response.records) {\n            customerList = response.records;\n            totalCount = response.total;\n            return {\n                customers: customerList,\n                total: totalCount,\n                pageNo: page,\n                pageSize: pageSize\n            };\n        }\n        return null;\n    } catch (error) {\n        console.error('加载客户列表失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('加载客户列表失败，请稍后重试', 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 获取客户详情\n */\nasync function getCustomerDetail(customerId) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('加载客户详情...');\n        }\n        \n        const response = await window.api.customers.get(customerId);\n        return response;\n    } catch (error) {\n        console.error('获取客户详情失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('获取客户详情失败，请稍后重试', 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 创建客户\n */\nasync function createCustomer(customerData) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('创建客户...');\n        }\n        \n        const response = await window.api.customers.create(customerData);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('客户创建成功', 'success');\n        }\n        return response;\n    } catch (error) {\n        console.error('创建客户失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('创建客户失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 更新客户\n */\nasync function updateCustomer(customerId, customerData) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('更新客户信息...');\n        }\n        \n        const response = await window.api.customers.update(customerId, customerData);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('客户信息更新成功', 'success');\n        }\n        return response;\n    } catch (error) {\n        console.error('更新客户失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('更新客户失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 删除客户\n */\nasync function deleteCustomer(customerId) {\n    try {\n        if (!window.UI || !window.UI.showConfirm) {\n            if (!confirm('确定删除此客户吗？')) return false;\n        } else {\n            const confirmed = await UI.showConfirm('确认删除', '确定删除此客户吗？');\n            if (!confirmed) return false;\n        }\n        \n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('删除客户...');\n        }\n        \n        const response = await window.api.customers.delete(customerId);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('客户已删除', 'success');\n        }\n        return true;\n    } catch (error) {\n        console.error('删除客户失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('删除客户失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return false;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 分配客户\n */\nasync function assignCustomer(customerId, assignedUserId) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('正在分配客户...');\n        }\n        \n        const response = await window.api.customers.update(customerId, {\n            assignedTo: assignedUserId\n        });\n        \n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('客户分配成功', 'success');\n        }\n        return response;\n    } catch (error) {\n        console.error('分配客户失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('分配客户失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n// ========== 线索管理API集成 ==========\n\n/**\n * 加载线索列表\n */\nasync function loadLeads(filter = 'all', keyword = '', page = 1) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('加载线索列表...');\n        }\n        \n        let params = {\n            pageNo: page,\n            pageSize: pageSize\n        };\n        \n        // 根据过滤条件添加参数\n        if (filter && filter !== 'all') {\n            params.status = filter;\n        }\n        \n        // 添加搜索关键词\n        if (keyword) {\n            params.keyword = keyword;\n        }\n        \n        const response = await window.api.leads.list(params);\n        \n        if (response && response.records) {\n            leadList = response.records;\n            totalCount = response.total;\n            return {\n                leads: leadList,\n                total: totalCount,\n                pageNo: page,\n                pageSize: pageSize\n            };\n        }\n        return null;\n    } catch (error) {\n        console.error('加载线索列表失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('加载线索列表失败，请稍后重试', 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 获取线索详情\n */\nasync function getLeadDetail(leadId) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('加载线索详情...');\n        }\n        \n        const response = await window.api.leads.get(leadId);\n        return response;\n    } catch (error) {\n        console.error('获取线索详情失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('获取线索详情失败，请稍后重试', 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 创建线索\n */\nasync function createLead(leadData) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('创建线索...');\n        }\n        \n        const response = await window.api.leads.create(leadData);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('线索创建成功', 'success');\n        }\n        return response;\n    } catch (error) {\n        console.error('创建线索失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('创建线索失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 更新线索\n */\nasync function updateLead(leadId, leadData) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('更新线索...');\n        }\n        \n        const response = await window.api.leads.update(leadId, leadData);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('线索更新成功', 'success');\n        }\n        return response;\n    } catch (error) {\n        console.error('更新线索失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('更新线索失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n/**\n * 线索转客户\n */\nasync function convertLeadToCustomer(leadId, customerData) {\n    try {\n        if (window.UI && window.UI.showLoading) {\n            UI.showLoading('正在转化线索...');\n        }\n        \n        const response = await window.api.leads.convert(leadId, customerData);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('线索已转化为客户', 'success');\n        }\n        return response;\n    } catch (error) {\n        console.error('转化线索失败:', error);\n        if (window.UI && window.UI.showMessage) {\n            UI.showMessage('转化线索失败: ' + (error.message || '未知错误'), 'danger');\n        }\n        return null;\n    } finally {\n        if (window.UI && window.UI.hideLoading) {\n            UI.hideLoading();\n        }\n    }\n}\n\n// ========== 辅助函数 ==========\n\n/**\n * 隐藏电话号码\n */\nfunction maskPhone(phone) {\n    if (!phone) return '未填写';\n    return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);\n}\n\n/**\n * 格式化日期\n */\nfunction formatDate(date) {\n    if (!date) return '未记录';\n    const d = new Date(date);\n    const today = new Date();\n    const diff = today - d;\n    const days = Math.floor(diff / (1000 * 60 * 60 * 24));\n    \n    if (days === 0) return '今天';\n    if (days === 1) return '1天前';\n    if (days < 7) return days + '天前';\n    if (days < 30) return Math.floor(days / 7) + '周前';\n    return Math.floor(days / 30) + '个月前';\n}\n\n/**\n * 获取客户等级标签\n */\nfunction getLevelLabel(level) {\n    const labels = {\n        'diamond': '钻石',\n        'vip': 'VIP',\n        'normal': '普通'\n    };\n    return labels[level] || level;\n}\n\n/**\n * 获取客户等级背景颜色类\n */\nfunction getLevelBgClass(level) {\n    switch(level) {\n        case 'diamond': return 'success/10';\n        case 'vip': return 'warning/10';\n        default: return 'gray-100';\n    }\n}\n\n/**\n * 获取客户等级文字颜色类\n */\nfunction getLevelTextClass(level) {\n    switch(level) {\n        case 'diamond': return 'success';\n        case 'vip': return 'warning';\n        default: return 'gray-600';\n    }\n}\n\n/**\n * 获取客户状态标签\n */\nfunction getStatusLabel(status) {\n    const labels = {\n        'active': '活跃',\n        'inactive': '沉睡',\n        'potential': '潜在',\n        'lost': '已流失'\n    };\n    return labels[status] || status;\n}\n\n/**\n * 获取线索优先级标签\n */\nfunction getPriorityLabel(priority) {\n    const labels = {\n        'urgent': '紧急',\n        'high': '高',\n        'medium': '中',\n        'low': '低'\n    };\n    return labels[priority] || priority;\n}\n\n/**\n * 获取线索状态标签\n */\nfunction getLeadStatusLabel(status) {\n    const labels = {\n        'new': '新线索',\n        'contacted': '已联系',\n        'qualified': '已资格',\n        'proposal': '已报价',\n        'negotiation': '谈判中',\n        'won': '已成交',\n        'lost': '已失败'\n    };\n    return labels[status] || status;\n}\n\n// 导出函数到全局作用域\nwindow.loadCustomers = loadCustomers;\nwindow.getCustomerDetail = getCustomerDetail;\nwindow.createCustomer = createCustomer;\nwindow.updateCustomer = updateCustomer;\nwindow.deleteCustomer = deleteCustomer;\nwindow.assignCustomer = assignCustomer;\nwindow.loadLeads = loadLeads;\nwindow.getLeadDetail = getLeadDetail;\nwindow.createLead = createLead;\nwindow.updateLead = updateLead;\nwindow.convertLeadToCustomer = convertLeadToCustomer;\nwindow.maskPhone = maskPhone;\nwindow.formatDate = formatDate;\nwindow.getLevelLabel = getLevelLabel;\nwindow.getLevelBgClass = getLevelBgClass;\nwindow.getLevelTextClass = getLevelTextClass;\nwindow.getStatusLabel = getStatusLabel;\nwindow.getPriorityLabel = getPriorityLabel;\nwindow.getLeadStatusLabel = getLeadStatusLabel;\n"
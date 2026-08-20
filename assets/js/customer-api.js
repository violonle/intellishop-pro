/**
 * Customer页面 API集成脚本
 * 处理与customers API的所有交互
 * @version 1.0.0
 */

class CustomerAPIManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 12;
        this.filters = {};
        this.currentFilter = 'all';
    }

    /**
     * 加载客户列表
     * @param {Object} options - 查询选项
     */
    async loadCustomers(options = {}) {
        try {
            UI.showLoading('正在加载客户数据...');
            
            const queryParams = {
                pageNo: options.pageNo || this.currentPage,
                pageSize: options.pageSize || this.pageSize,
                ...this.filters
            };

            // 调用API获取客户列表
            const response = await api.customers.list(queryParams);
            const customers = response.data || response;

            // 缓存当前页码
            this.currentPage = queryParams.pageNo;

            return customers;
        } catch (error) {
            console.error('加载客户列表失败:', error);
            UI.showMessage('加载客户数据失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 搜索客户
     * @param {string} keyword - 搜索关键词
     */
    async searchCustomers(keyword) {
        try {
            if (!keyword || keyword.trim().length === 0) {
                return await this.loadCustomers();
            }

            UI.showLoading('正在搜索...');
            
            const response = await api.customers.search(keyword, 1, this.pageSize);
            return response.data || response;
        } catch (error) {
            console.error('搜索客户失败:', error);
            UI.showMessage('搜索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 创建客户
     * @param {Object} customerData - 客户数据
     */
    async createCustomer(customerData) {
        try {
            UI.showLoading('正在创建客户...');
            
            const response = await api.customers.create({
                name: customerData.name,
                phone: customerData.phone,
                email: customerData.email,
                company: customerData.company,
                address: customerData.address,
                sourceType: customerData.sourceType || 'manual',
                status: customerData.status || 'active',
                level: customerData.level || 'normal',
                purchaseIntention: customerData.purchaseIntention,
                budget: customerData.budget,
                tags: customerData.tags || []
            });

            UI.showMessage('客户创建成功', 'success');
            return response;
        } catch (error) {
            console.error('创建客户失败:', error);
            UI.showMessage('创建客户失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 更新客户
     * @param {number} customerId - 客户ID
     * @param {Object} customerData - 更新的客户数据
     */
    async updateCustomer(customerId, customerData) {
        try {
            UI.showLoading('正在更新客户...');
            
            const response = await api.customers.update(customerId, customerData);
            
            UI.showMessage('客户更新成功', 'success');
            return response;
        } catch (error) {
            console.error('更新客户失败:', error);
            UI.showMessage('更新客户失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 删除客户
     * @param {number} customerId - 客户ID
     */
    async deleteCustomer(customerId) {
        try {
            const confirmed = confirm('确定要删除这个客户吗？');
            if (!confirmed) return;

            UI.showLoading('正在删除客户...');
            
            const response = await api.customers.delete(customerId);
            
            UI.showMessage('客户删除成功', 'success');
            return response;
        } catch (error) {
            console.error('删除客户失败:', error);
            UI.showMessage('删除客户失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 分配客户
     * @param {number} customerId - 客户ID
     * @param {number} userId - 分配目标用户ID
     */
    async assignCustomer(customerId, userId) {
        try {
            UI.showLoading('正在分配客户...');
            
            const response = await api.customers.assign(customerId, userId);
            
            UI.showMessage('客户分配成功', 'success');
            return response;
        } catch (error) {
            console.error('分配客户失败:', error);
            UI.showMessage('分配客户失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 获取客户详情
     * @param {number} customerId - 客户ID
     */
    async getCustomerDetail(customerId) {
        try {
            const response = await api.customers.get(customerId);
            return response;
        } catch (error) {
            console.error('获取客户详情失败:', error);
            UI.showMessage('获取客户详情失败: ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * 获取客户统计信息
     */
    async getCustomerStats() {
        try {
            const response = await api.customers.getStats();
            return response;
        } catch (error) {
            console.error('获取客户统计失败:', error);
            return null;
        }
    }

    /**
     * 升级客户等级
     * @param {number} customerId - 客户ID
     * @param {string} newLevel - 新等级
     */
    async upgradeCustomerLevel(customerId, newLevel) {
        try {
            UI.showLoading('正在升级客户等级...');
            
            const response = await api.customers.upgradeLVIP(customerId);
            
            UI.showMessage('客户等级升级成功', 'success');
            return response;
        } catch (error) {
            console.error('升级客户等级失败:', error);
            UI.showMessage('升级失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 标记客户为流失
     * @param {number} customerId - 客户ID
     */
    async markAsLost(customerId) {
        try {
            UI.showLoading('正在标记客户...');
            
            const response = await api.customers.markLost(customerId);
            
            UI.showMessage('客户已标记为流失', 'success');
            return response;
        } catch (error) {
            console.error('标记客户失败:', error);
            UI.showMessage('标记失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 恢复流失客户
     * @param {number} customerId - 客户ID
     */
    async recoverCustomer(customerId) {
        try {
            UI.showLoading('正在恢复客户...');
            
            const response = await api.customers.recover(customerId);
            
            UI.showMessage('客户已恢复', 'success');
            return response;
        } catch (error) {
            console.error('恢复客户失败:', error);
            UI.showMessage('恢复失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 获取VIP客户列表
     */
    async getVIPCustomers() {
        try {
            const response = await api.customers.list({
                page: 1,
                pageSize: this.pageSize,
                level: 'vip'
            });
            
            return response.data || response;
        } catch (error) {
            console.error('获取VIP客户失败:', error);
            return [];
        }
    }

    /**
     * 获取活跃客户列表
     */
    async getActiveCustomers() {
        try {
            const response = await api.customers.list({
                page: 1,
                pageSize: this.pageSize,
                status: 'active'
            });
            
            return response.data || response;
        } catch (error) {
            console.error('获取活跃客户失败:', error);
            return [];
        }
    }

    /**
     * 获取高价值客户列表
     */
    async getHighValueCustomers() {
        try {
            const response = await api.customers.list({
                page: 1,
                pageSize: this.pageSize,
                level: 'high-value'
            });
            
            return response.data || response;
        } catch (error) {
            console.error('获取高价值客户失败:', error);
            return [];
        }
    }

    /**
     * 获取客户AI分析
     * @param {number} customerId - 客户ID
     */
    async getCustomerAIAnalysis(customerId) {
        try {
            // 调用AI分析接口
            const response = await api.aiCustomer.analyze(customerId);
            return response;
        } catch (error) {
            console.error('获取AI分析失败:', error);
            return null;
        }
    }

    /**
     * 获取客户AI推荐
     * @param {number} customerId - 客户ID
     */
    async getCustomerAIRecommendations(customerId) {
        try {
            // 调用AI推荐接口
            const response = await api.aiScript.recommend(customerId, 'customer_service');
            return response;
        } catch (error) {
            console.error('获取AI推荐失败:', error);
            return null;
        }
    }

    /**
     * 获取客户价值评分
     * @param {number} customerId - 客户ID
     */
    async getCustomerValueScore(customerId) {
        try {
            // 调用AI高级接口获取CLV预测
            const customer = await this.getCustomerDetail(customerId);
            if (!customer) return null;

            const result = await api.aiAdvanced.predictCLV([{
                id: customerId,
                ...customer
            }]);

            return result;
        } catch (error) {
            console.error('获取客户价值评分失败:', error);
            return null;
        }
    }

    /**
     * 设置筛选条件
     * @param {Object} filters - 筛选条件
     */
    setFilters(filters) {
        this.filters = filters;
        this.currentPage = 1;
    }

    /**
     * 清空筛选条件
     */
    clearFilters() {
        this.filters = {};
        this.currentPage = 1;
    }

    /**
     * 批量导入客户
     * @param {File} file - CSV/Excel文件
     */
    async importCustomers(file) {
        try {
            UI.showLoading('正在导入客户...');
            
            const response = await api.files.upload(file, 'customer', null);
            
            UI.showMessage('客户导入成功', 'success');
            return response;
        } catch (error) {
            console.error('客户导入失败:', error);
            UI.showMessage('客户导入失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 导出客户数据
     * @param {string} format - 导出格式 (csv/excel)
     */
    async exportCustomers(format = 'csv') {
        try {
            UI.showLoading('正在导出客户...');
            
            // 构建导出URL
            const exportUrl = `${api.apiURL}/customers/export?format=${format}`;
            
            // 触发下载
            window.location.href = exportUrl;
            
            UI.showMessage('客户导出成功', 'success');
        } catch (error) {
            console.error('客户导出失败:', error);
            UI.showMessage('客户导出失败: ' + error.message, 'error');
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 批量分配客户
     * @param {Array} customerIds - 客户ID数组
     * @param {number} userId - 分配目标用户ID
     */
    async assignCustomersBatch(customerIds, userId) {
        try {
            UI.showLoading('正在批量分配客户...');
            
            const response = await api.customers.assignBatch(customerIds, userId);
            
            UI.showMessage(`成功分配 ${customerIds.length} 个客户`, 'success');
            return response;
        } catch (error) {
            console.error('批量分配客户失败:', error);
            UI.showMessage('批量分配失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }
}

// 导出全局实例
window.customerManager = new CustomerAPIManager();

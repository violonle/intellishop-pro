/**
 * Lead页面 API集成脚本
 * 处理与leads API的所有交互
 * @version 1.0.0
 */

class LeadsAPIManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.filters = {};
        this.currentTab = 'leads'; // 'leads' 或 'customers'
    }

    /**
     * 加载线索列表
     * @param {Object} options - 查询选项
     */
    async loadLeads(options = {}) {
        try {
            UI.showLoading('正在加载线索数据...');
            
            const queryParams = {
                page: options.page || this.currentPage,
                pageSize: options.pageSize || this.pageSize,
                ...this.filters
            };

            // 调用API获取线索列表
            const response = await api.leads.list(queryParams);
            const leads = response.data || response;

            // 缓存当前页码
            this.currentPage = queryParams.page;

            return leads;
        } catch (error) {
            console.error('加载线索列表失败:', error);
            UI.showMessage('加载线索数据失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 搜索线索
     * @param {string} keyword - 搜索关键词
     */
    async searchLeads(keyword) {
        try {
            if (!keyword || keyword.trim().length === 0) {
                return await this.loadLeads();
            }

            UI.showLoading('正在搜索...');
            
            const response = await api.leads.search(keyword, 1, this.pageSize);
            return response.data || response;
        } catch (error) {
            console.error('搜索线索失败:', error);
            UI.showMessage('搜索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 创建线索
     * @param {Object} leadData - 线索数据
     */
    async createLead(leadData) {
        try {
            UI.showLoading('正在创建线索...');
            
            const response = await api.leads.create({
                title: leadData.title,
                description: leadData.description,
                source: leadData.source || 'manual',
                priority: leadData.priority || 'medium',
                estimatedValue: leadData.estimatedValue,
                interestedProducts: leadData.interestedProducts,
                budgetRange: leadData.budgetRange,
                decisionTimeline: leadData.decisionTimeline,
                followUpDate: leadData.followUpDate,
                assignedTo: leadData.assignedTo
            });

            UI.showMessage('线索创建成功', 'success');
            return response;
        } catch (error) {
            console.error('创建线索失败:', error);
            UI.showMessage('创建线索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 更新线索
     * @param {number} leadId - 线索ID
     * @param {Object} leadData - 更新的线索数据
     */
    async updateLead(leadId, leadData) {
        try {
            UI.showLoading('正在更新线索...');
            
            const response = await api.leads.update(leadId, leadData);
            
            UI.showMessage('线索更新成功', 'success');
            return response;
        } catch (error) {
            console.error('更新线索失败:', error);
            UI.showMessage('更新线索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 分配线索
     * @param {number} leadId - 线索ID
     * @param {number} userId - 分配目标用户ID
     */
    async assignLead(leadId, userId) {
        try {
            UI.showLoading('正在分配线索...');
            
            const response = await api.leads.assign(leadId, userId);
            
            UI.showMessage('线索分配成功', 'success');
            return response;
        } catch (error) {
            console.error('分配线索失败:', error);
            UI.showMessage('分配线索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 更新线索状态
     * @param {number} leadId - 线索ID
     * @param {string} status - 新状态
     */
    async updateLeadStatus(leadId, status) {
        try {
            UI.showLoading('正在更新状态...');
            
            const response = await api.leads.updateStatus(leadId, status);
            
            UI.showMessage('状态更新成功', 'success');
            return response;
        } catch (error) {
            console.error('更新线索状态失败:', error);
            UI.showMessage('更新状态失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 线索转客户
     * @param {number} leadId - 线索ID
     */
    async convertToCustomer(leadId) {
        try {
            UI.showLoading('正在转换为客户...');
            
            const response = await api.leads.convert(leadId, {});
            
            UI.showMessage('线索已成功转为客户', 'success');
            return response;
        } catch (error) {
            console.error('线索转客户失败:', error);
            UI.showMessage('转换失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 删除线索
     * @param {number} leadId - 线索ID
     */
    async deleteLead(leadId) {
        try {
            const confirmed = confirm('确定要删除这条线索吗？');
            if (!confirmed) return;

            UI.showLoading('正在删除线索...');
            
            const response = await api.leads.delete(leadId);
            
            UI.showMessage('线索删除成功', 'success');
            return response;
        } catch (error) {
            console.error('删除线索失败:', error);
            UI.showMessage('删除线索失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * 获取线索统计信息
     */
    async getLeadStats() {
        try {
            const response = await api.leads.getStats();
            return response;
        } catch (error) {
            console.error('获取线索统计失败:', error);
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
     * 加载客户列表
     * @param {Object} options - 查询选项
     */
    async loadCustomers(options = {}) {
        try {
            UI.showLoading('正在加载客户数据...');
            
            const queryParams = {
                page: options.page || this.currentPage,
                pageSize: options.pageSize || this.pageSize,
                ...this.filters
            };

            // 调用API获取客户列表
            const response = await api.customers.list(queryParams);
            const customers = response.data || response;

            this.currentPage = queryParams.page;
            return customers;
        } catch (error) {
            console.error('加载客户列表失败:', error);
            UI.showMessage('加载客户数据失败: ' + error.message, 'error');
            throw error;
        } finally {
            UI.hideLoading();
        }
    }
}

// 导出全局实例
window.leadsManager = new LeadsAPIManager();

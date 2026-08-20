import request from '@/utils/request';

export interface AgentTask {
    id: number;
    agentType: string;
    taskTitle: string;
    customerName: string;
    customerId?: number;
    reason: string;
    proposedAction: string;
    confidenceScore: number;
    status: 'pending' | 'executed' | 'rejected';
    createdAt: string;
}

export const agentService = {
    // 获取智能体概览汇总
    getSummary: () => {
        return request<any>({
            url: '/ai/agents/summary',
            method: 'get',
        });
    },

    // 获取所有智能体配置列表
    getConfigs: () => {
        return request<any>({
            url: '/ai/agents/configs',
            method: 'get',
        });
    },

    // 更新智能体配置
    updateConfig: (agentType: string, data: any) => {
        return request<any>({
            url: `/ai/agents/configs/${agentType}`,
            method: 'put',
            data,
        });
    },

    // 获取指定类型的智能体待办/任务列表
    getTasks: (params?: { agentType?: string; status?: string }) => {
        return request<any>({
            url: '/ai/agents/tasks',
            method: 'get',
            params: {
                agentType: params?.agentType || 'all',
                status: params?.status || 'all',
            },
        });
    },

    // 确认执行任务
    confirmTask: (id: number | string) => {
        return request<any>({
            url: `/ai/agents/tasks/${id}/confirm`,
            method: 'post',
        });
    },

    // 拒绝/忽略任务
    rejectTask: (id: number | string, reason?: string) => {
        return request<any>({
            url: `/ai/agents/tasks/${id}/reject`,
            method: 'post',
            params: { reason: reason || '销售手动忽略' },
        });
    },

    // 获取客户画像洞察
    getCustomerInsights: () => {
        return request<any>({
            url: '/ai/conversation/summary',
            method: 'get',
        });
    },

    // 获取营收预测智能体大盘
    getRevenueDashboard: () => {
        return request<any>({
            url: '/ai/revenue/dashboard',
            method: 'get',
        });
    },

    // 获取营收预测中的风险商机明细
    getAtRiskDeals: () => {
        return request<any[]>({
            url: '/ai/revenue/deals/at-risk',
            method: 'get',
        });
    },

    // 获取客户行为雷达信号
    getSignals: () => {
        return request<any>({
            url: '/ai/signals',
            method: 'get',
        });
    }
};

export default agentService;

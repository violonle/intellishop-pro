import request from '@/utils/request';

// 仪表盘核心数据
export const getSalesDashboard = () => {
    return request({
        url: '/analytics/dashboard/sales',
        method: 'get',
    });
};

export const getCustomerDashboard = () => {
    return request({
        url: '/analytics/dashboard/customer',
        method: 'get',
    });
};

export const getPerformanceDashboard = () => {
    return request({
        url: '/analytics/dashboard/performance',
        method: 'get',
    });
};

export const getProductDashboard = () => {
    return request({
        url: '/analytics/dashboard/product',
        method: 'get',
    });
};

export const getSalesTrend = (params: { startDate: string; endDate: string; granularity: string }) => {
    return request({
        url: '/analytics/sales/trend',
        method: 'get',
        params,
    });
};

// 7 大数据分析看板专属接口
export const getSalesRanking = (params?: { dimension?: string; limit?: number }) => {
    return request({
        url: '/analytics/sales/ranking',
        method: 'get',
        params,
    });
};

export const getSalesPersonRanking = (params?: { limit?: number }) => {
    return request({
        url: '/analytics/sales/person-ranking',
        method: 'get',
        params,
    });
};

export const getSalesChannelAnalysis = () => {
    return request({
        url: '/analytics/sales/channel',
        method: 'get',
    });
};

export const getSalesBehaviorAnalysis = () => {
    return request({
        url: '/analytics/sales/behavior',
        method: 'get',
    });
};

export const getAdvancedAnalyticsData = (timeRange?: string) => {
    return request({
        url: '/analytics/advanced-data',
        method: 'get',
        params: { timeRange: timeRange || '30' },
    });
};

export const getSalesFunnelAnalysis = () => {
    return request({
        url: '/analytics/sales/funnel',
        method: 'get',
    });
};

export const getPipelineHealth = () => {
    return request({
        url: '/ai/revenue/pipeline',
        method: 'get',
    });
};

export const getRiskAnalysis = () => {
    return request({
        url: '/ai/revenue/deals/at-risk',
        method: 'get',
    });
};

export const getSalesTeamInsight = () => {
    return request({
        url: '/analytics/sales/team-insight',
        method: 'post',
    });
};

export const getSalesAnalyticsInsight = (timeRange?: string) => {
    return request({
        url: '/analytics/sales/analytics-insight',
        method: 'post',
        params: { timeRange: timeRange || '30' },
    });
};

export default {
    getSalesDashboard,
    getCustomerDashboard,
    getPerformanceDashboard,
    getProductDashboard,
    getSalesTrend,
    getSalesRanking,
    getSalesPersonRanking,
    getSalesChannelAnalysis,
    getSalesBehaviorAnalysis,
    getAdvancedAnalyticsData,
    getSalesFunnelAnalysis,
    getPipelineHealth,
    getRiskAnalysis,
    getSalesTeamInsight,
    getSalesAnalyticsInsight
};

import { http } from './http';

export const analyticsService = {
    // ========== Dashboard Stats ==========
    getSalesDashboard: () => {
        return http.get<any>('/analytics/dashboard/sales');
    },
    getCustomerDashboard: () => {
        return http.get<any>('/analytics/dashboard/customer');
    },
    getPerformanceDashboard: () => {
        return http.get<any>('/analytics/dashboard/performance');
    },
    getProductDashboard: () => {
        return http.get<any>('/analytics/dashboard/product');
    },

    // ========== Sales Analysis ==========
    getSalesTrend: (startDate: string, endDate: string, _granularity = 'day') => {
        return http.get<any>('/analytics/sales/trend', { params: { startDate, endDate, granularity: _granularity } });
    },
    getSalesRanking: (dimension = 'sales', limit = 10) => {
        return http.get<any>('/analytics/sales/ranking', { params: { dimension, limit } });
    },
    getSalesChannelAnalysis: () => {
        return http.get<any>('/analytics/sales/channel');
    },
    getSalesPersonRanking: (limit = 10) => {
        return http.get<Array<{ name: string; value: number; userId?: number; avatar?: string }>>('/analytics/sales/person-ranking', {
            params: { limit }
        });
    },
    getSalesTeamInsight: () => {
        return http.post<string>('/analytics/sales/team-insight', {});
    },
    getSalesBehaviorAnalysis: (startDate: string, endDate: string, userId?: number) => {
        return http.get<any>('/analytics/sales/behavior', { params: { startDate, endDate, userId } });
    },
    getSalesFunnelAnalysis: () => {
        return http.get<any>('/analytics/sales/funnel');
    },

    // ========== Customer Analysis ==========
    getCustomerLifecycleAnalysis: () => {
        return http.get<any>('/analytics/customer/lifecycle');
    },
    getCustomerValueAnalysis: () => {
        return http.get<any>('/analytics/customer/value');
    },
    getCustomerBehaviorAnalysis: () => {
        return http.get<any>('/analytics/customer/behavior');
    },
    getCustomerChurnAnalysis: () => {
        return http.get<any>('/analytics/customer/churn');
    },
    getCustomerDistributionAnalysis: () => {
        return http.get<any>('/analytics/customer/distribution');
    },

    // ========== Product Analysis ==========
    getProductPopularityAnalysis: () => {
        return http.get<any>('/analytics/product/popularity');
    },
    getProductInventoryAnalysis: () => {
        return http.get<any>('/analytics/product/inventory');
    },
    getProductProfitAnalysis: () => {
        return http.get<any>('/analytics/product/profit');
    },
    getProductCategorySalesAnalysis: () => {
        return http.get<any>('/analytics/product/category-sales');
    },

    // ========== Comparison Analysis ==========
    getMonthOverMonthComparison: () => {
        return http.get<any>('/analytics/comparison/month-over-month');
    },

    // ========== Forecast ==========
    predictSalesTrend: (days = 30) => {
        return http.get<any>('/analytics/predict/sales-trend', { params: { days } });
    },
    predictSalesConversion: () => {
        return http.get<any>('/analytics/predict/conversion-rate');
    },
    predictCustomerChurn: () => {
        return http.get<any>('/analytics/predict/customer-churn');
    },
    predictInventoryDemand: () => {
        return http.get<any>('/analytics/predict/inventory-demand');
    },
    getAiLeads: () => {
        return http.get<any>('/ai/leads');
    },

    // ========== Report Generation (Returns Blob/File) ==========
    generateSalesReport: (startDate: string, endDate: string) => {
        return http.get<Blob>('/analytics/report/sales', {
            params: { startDate, endDate },
            responseType: 'blob' as any
        });
    },
    getAnomalyAlerts: () => {
        return http.get<any[]>('/analytics/alerts');
    },

    getAdvancedData: (timeRange = '30') => {
        return http.get<any>('/analytics/advanced-data', { params: { timeRange } });
    },

    getSalesAnalyticsInsight: (timeRange = '30') => {
        return http.post<string>('/analytics/sales/analytics-insight', {}, { params: { timeRange } });
    },
};

export default analyticsService;

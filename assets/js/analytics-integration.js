/**
 * ShopPro 数据分析和仪表板前后端集成脚本
 * 提供所有数据分析相关的API包装函数和数据处理功能
 * @version 1.0.0
 */

// ==================== 仪表板数据获取 ====================

/**
 * 获取仪表板主要数据
 * @returns {Promise<Object>} 仪表板数据
 */
async function getDashboardData() {
    try {
        const response = await window.api.analytics.getDashboard();
        
        if (!response) {
            return null;
        }

        // 统一数据格式
        return {
            kpis: response.kpis || {},
            trends: response.trends || {},
            topPerformers: response.topPerformers || [],
            alerts: response.alerts || [],
            recentActivity: response.recentActivity || [],
            forecast: response.forecast || {}
        };
    } catch (error) {
        console.error('获取仪表板数据失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('获取仪表板数据失败', 'danger');
        }
        return null;
    }
}

/**
 * 获取今日数据概览
 * @returns {Promise<Object>} 今日数据
 */
async function getTodaySnapshot() {
    try {
        const dashboard = await getDashboardData();
        if (!dashboard || !dashboard.kpis) {
            return null;
        }

        return {
            newLeads: dashboard.kpis.newLeadsToday || 0,
            customerVisits: dashboard.kpis.visitsToday || 0,
            dealsClosedToday: dashboard.kpis.dealsToday || 0,
            salesAmountToday: dashboard.kpis.salesAmountToday || 0,
            conversionRateToday: dashboard.kpis.conversionRateToday || 0
        };
    } catch (error) {
        console.error('获取今日数据失败:', error);
        return null;
    }
}

// ==================== 销售分析 ====================

/**
 * 获取销售分析数据
 * @param {Object} params - 查询参数 {startDate, endDate, period, dimension}
 * @returns {Promise<Object>} 销售分析数据
 */
async function getSalesAnalysis(params = {}) {
    try {
        // 设置默认参数
        const queryParams = {
            period: params.period || 'month',  // day|week|month|quarter|year
            dimension: params.dimension || 'total',  // total|product|team|channel
            ...params
        };

        const response = await window.api.analytics.getSalesAnalysis(queryParams);
        
        return {
            totalSales: response.totalSales || 0,
            salesTrend: response.salesTrend || [],
            salesByCategory: response.salesByCategory || [],
            salesByChannel: response.salesByChannel || [],
            topProducts: response.topProducts || [],
            comparison: response.comparison || {}
        };
    } catch (error) {
        console.error('获取销售分析数据失败:', error);
        return null;
    }
}

/**
 * 获取客户分析数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 客户分析数据
 */
async function getCustomerAnalysis(params = {}) {
    try {
        const queryParams = {
            period: params.period || 'month',
            ...params
        };

        const response = await window.api.analytics.getCustomerAnalysis(queryParams);
        
        return {
            totalCustomers: response.totalCustomers || 0,
            newCustomers: response.newCustomers || 0,
            activeCustomers: response.activeCustomers || 0,
            vipCustomers: response.vipCustomers || 0,
            churnRate: response.churnRate || 0,
            customerLifetimeValue: response.customerLifetimeValue || 0,
            customerRetention: response.customerRetention || 0,
            customerSegmentation: response.customerSegmentation || []
        };
    } catch (error) {
        console.error('获取客户分析数据失败:', error);
        return null;
    }
}

/**
 * 获取产品分析数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 产品分析数据
 */
async function getProductAnalysis(params = {}) {
    try {
        const queryParams = {
            period: params.period || 'month',
            ...params
        };

        const response = await window.api.analytics.getProductAnalysis(queryParams);
        
        return {
            totalProducts: response.totalProducts || 0,
            topProducts: response.topProducts || [],
            slowMovingProducts: response.slowMovingProducts || [],
            productRevenue: response.productRevenue || [],
            inventoryStatus: response.inventoryStatus || {}
        };
    } catch (error) {
        console.error('获取产品分析数据失败:', error);
        return null;
    }
}

// ==================== 转化率分析 ====================

/**
 * 获取转化率数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 转化率数据
 */
async function getConversionAnalysis(params = {}) {
    try {
        const queryParams = {
            period: params.period || 'month',
            ...params
        };

        const response = await window.api.analytics.getConversionRate(queryParams);
        
        return {
            leadToCustomer: response.leadToCustomer || 0,
            quoteToDeal: response.quoteToDeal || 0,
            viewToLead: response.viewToLead || 0,
            funnelData: response.funnelData || [],
            conversionBySource: response.conversionBySource || [],
            conversionTrend: response.conversionTrend || []
        };
    } catch (error) {
        console.error('获取转化率数据失败:', error);
        return null;
    }
}

// ==================== 预测和预警 ====================

/**
 * 获取销售预测数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 预测数据
 */
async function getSalesForecast(params = {}) {
    try {
        const queryParams = {
            days: params.days || 30,
            confidence: params.confidence || 0.95,
            ...params
        };

        const response = await window.api.analytics.getSalesForecast(queryParams);
        
        return {
            forecast: response.forecast || [],
            confidence: response.confidence || 0.95,
            trend: response.trend || 'stable',  // up|down|stable
            expectedRange: response.expectedRange || {}
        };
    } catch (error) {
        console.error('获取销售预测失败:', error);
        return null;
    }
}

/**
 * 获取客户流失预测
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 流失预测数据
 */
async function getChurnPrediction(params = {}) {
    try {
        const response = await window.api.analytics.getChurnPrediction(params);
        
        return {
            riskCustomers: response.riskCustomers || [],
            churnRate: response.churnRate || 0,
            predictions: response.predictions || [],
            recommendations: response.recommendations || []
        };
    } catch (error) {
        console.error('获取客户流失预测失败:', error);
        return null;
    }
}

// ==================== 数据对比分析 ====================

/**
 * 获取对比数据（本月vs上月、本年vs去年等）
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 对比数据
 */
async function getComparisonAnalysis(params = {}) {
    try {
        const queryParams = {
            type: params.type || 'monthOverMonth',  // monthOverMonth|yearOverYear|quarterOverQuarter
            ...params
        };

        const response = await window.api.analytics.getComparison(queryParams);
        
        return {
            current: response.current || {},
            previous: response.previous || {},
            change: response.change || {},
            percentageChange: response.percentageChange || 0,
            trend: response.trend || 'stable'
        };
    } catch (error) {
        console.error('获取对比数据失败:', error);
        return null;
    }
}

// ==================== 报告生成 ====================

/**
 * 生成分析报告
 * @param {string} reportType - 报告类型：daily|weekly|monthly|quarterly|annual|custom
 * @param {Object} params - 报告参数
 * @returns {Promise<Object>} 报告数据
 */
async function generateReport(reportType = 'monthly', params = {}) {
    try {
        if (!reportType) {
            if (window.UI && window.UI.showMessage) {
                UI.showMessage('请选择报告类型', 'warning');
            }
            return null;
        }

        const response = await window.api.analytics.generateReport(reportType, params);
        
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('报告生成成功', 'success');
        }
        
        return response;
    } catch (error) {
        console.error('生成报告失败:', error);
        if (window.UI && window.UI.showMessage) {
            UI.showMessage('生成报告失败：' + (error.message || '未知错误'), 'danger');
        }
        return null;
    }
}

// ==================== 数据导出 ====================

/**
 * 导出数据为 CSV
 * @param {Object} data - 数据对象
 * @param {string} filename - 文件名
 * @returns {string} CSV 内容
 */
function exportDataToCSV(data, filename = 'export.csv') {
    let csv = '';
    
    // 处理数组数据
    if (Array.isArray(data) && data.length > 0) {
        // 获取表头
        const headers = Object.keys(data[0]);
        csv = headers.join(',') + '\n';
        
        // 添加数据行
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // 处理包含逗号或引号的值
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            });
            csv += values.join(',') + '\n';
        });
    } else if (typeof data === 'object') {
        // 处理对象数据
        const entries = Object.entries(data);
        csv = entries.map(([key, value]) => `${key},${value}`).join('\n');
    }
    
    return csv;
}

/**
 * 下载 CSV 文件
 * @param {string} csvContent - CSV 内容
 * @param {string} filename - 文件名
 */
function downloadCSV(csvContent, filename = 'export.csv') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * 导出为 JSON
 * @param {Object} data - 数据对象
 * @param {string} filename - 文件名
 */
function downloadJSON(data, filename = 'export.json') {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== 数据格式化 ====================

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额
 */
function formatAmount(amount) {
    if (typeof amount !== 'number') return '¥0.00';
    return `¥${amount.toFixed(2)}`;
}

/**
 * 格式化大数字（万级、百万级显示）
 * @param {number} value - 数值
 * @returns {string} 格式化后的数值
 */
function formatLargeNumber(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 10000) {
        return (value / 10000).toFixed(2) + '万';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + 'K';
    }
    return value.toString();
}

/**
 * 格式化百分比
 * @param {number} value - 0-1 之间的小数或 0-100 的数字
 * @returns {string} 格式化后的百分比
 */
function formatPercentage(value) {
    if (typeof value !== 'number') return '0%';
    
    const percent = value <= 1 ? value * 100 : value;
    return `${percent.toFixed(1)}%`;
}

/**
 * 格式化趋势指示
 * @param {number} current - 当前值
 * @param {number} previous - 上个周期值
 * @returns {Object} 趋势对象 {trend, percentageChange, arrow}
 */
function formatTrend(current, previous) {
    if (!previous || previous === 0) {
        return {
            trend: 'neutral',
            percentageChange: 0,
            arrow: '→',
            class: 'text-gray-500'
        };
    }

    const change = ((current - previous) / previous) * 100;
    
    if (change > 0) {
        return {
            trend: 'up',
            percentageChange: change.toFixed(1),
            arrow: '↗',
            class: 'text-green-600'
        };
    } else if (change < 0) {
        return {
            trend: 'down',
            percentageChange: Math.abs(change).toFixed(1),
            arrow: '↘',
            class: 'text-red-600'
        };
    } else {
        return {
            trend: 'neutral',
            percentageChange: 0,
            arrow: '→',
            class: 'text-gray-500'
        };
    }
}

/**
 * 格式化KPI卡片数据
 * @param {string} label - 标签
 * @param {number} value - 值
 * @param {Object} metadata - 元数据（previousValue, unit等）
 * @returns {Object} 格式化后的KPI对象
 */
function formatKPICard(label, value, metadata = {}) {
    const trend = metadata.previousValue ? 
        formatTrend(value, metadata.previousValue) : 
        { trend: 'neutral', percentageChange: 0, arrow: '→', class: 'text-gray-500' };

    return {
        label: label,
        value: metadata.unit === 'percent' ? formatPercentage(value) : 
               metadata.unit === 'amount' ? formatAmount(value) :
               formatLargeNumber(value),
        rawValue: value,
        trend: trend,
        unit: metadata.unit || 'number'
    };
}

/**
 * 格式化图表数据
 * @param {Array} rawData - 原始数据数组
 * @param {string} type - 图表类型：line|bar|pie
 * @returns {Object} 图表配置对象
 */
function formatChartData(rawData, type = 'line') {
    if (!Array.isArray(rawData) || rawData.length === 0) {
        return {
            labels: [],
            datasets: []
        };
    }

    const labels = rawData.map(item => item.label || item.name || item.time);
    
    if (type === 'pie') {
        return {
            labels: labels,
            datasets: [{
                data: rawData.map(item => item.value),
                backgroundColor: generateColors(rawData.length)
            }]
        };
    } else if (type === 'bar' || type === 'line') {
        return {
            labels: labels,
            datasets: rawData[0].datasets ? rawData[0].datasets : [{
                label: 'Data',
                data: rawData.map(item => item.value),
                borderColor: '#3B82F6',
                backgroundColor: type === 'bar' ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
            }]
        };
    }

    return { labels, datasets: [] };
}

/**
 * 生成图表颜色
 * @param {number} count - 颜色数量
 * @returns {Array} 颜色数组
 */
function generateColors(count) {
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    return result;
}

// ==================== 实时数据更新 ====================

/**
 * 启动自动刷新
 * @param {Function} callback - 刷新回调函数
 * @param {number} interval - 刷新间隔（毫秒），默认 60000ms（1分钟）
 * @returns {number} 定时器 ID
 */
function startAutoRefresh(callback, interval = 60000) {
    if (typeof callback !== 'function') {
        console.error('callback 必须是一个函数');
        return null;
    }

    // 立即执行一次
    callback();

    // 设置定时刷新
    return setInterval(callback, interval);
}

/**
 * 停止自动刷新
 * @param {number} timerId - 定时器 ID
 */
function stopAutoRefresh(timerId) {
    if (timerId) {
        clearInterval(timerId);
    }
}

/**
 * 手动刷新数据
 * @param {Function} callback - 刷新回调
 */
async function manualRefresh(callback) {
    try {
        if (window.UI && window.UI.showLoading) {
            UI.showLoading();
        }

        await callback();

        if (window.UI && window.UI.hideLoading) {
            UI.hideLoading();
        }

        if (window.UI && window.UI.showMessage) {
            UI.showMessage('数据已刷新', 'success');
        }
    } catch (error) {
        console.error('刷新数据失败:', error);
        if (window.UI && window.UI.hideLoading) {
            UI.hideLoading();
        }
    }
}

// ==================== UI 交互函数 ====================

/**
 * 获取日期范围选项
 * @returns {Array} 日期范围选项
 */
function getDateRangeOptions() {
    const today = new Date();
    const options = [
        {
            label: '今天',
            value: 'today',
            getDateRange: () => ({
                startDate: new Date(today.setHours(0, 0, 0, 0)),
                endDate: new Date(today.setHours(23, 59, 59, 999))
            })
        },
        {
            label: '本周',
            value: 'week',
            getDateRange: () => {
                const start = new Date(today);
                start.setDate(today.getDate() - today.getDay());
                return { startDate: start, endDate: today };
            }
        },
        {
            label: '本月',
            value: 'month',
            getDateRange: () => {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                return { startDate: start, endDate: today };
            }
        },
        {
            label: '本季度',
            value: 'quarter',
            getDateRange: () => {
                const quarter = Math.floor(today.getMonth() / 3);
                const start = new Date(today.getFullYear(), quarter * 3, 1);
                return { startDate: start, endDate: today };
            }
        },
        {
            label: '本年',
            value: 'year',
            getDateRange: () => {
                const start = new Date(today.getFullYear(), 0, 1);
                return { startDate: start, endDate: today };
            }
        }
    ];

    return options;
}

/**
 * 切换时间范围
 * @param {string} rangeType - 范围类型
 * @returns {Object} 日期范围对象
 */
function switchDateRange(rangeType) {
    const options = getDateRangeOptions();
    const option = options.find(opt => opt.value === rangeType);
    
    if (option) {
        return option.getDateRange();
    }
    
    return { startDate: new Date(), endDate: new Date() };
}

/**
 * 切换维度分析
 * @param {string} dimension - 维度
 * @returns {Object} 维度配置
 */
function switchDimension(dimension) {
    const dimensions = {
        'total': { label: '总体', icon: '📊' },
        'product': { label: '按产品', icon: '📦' },
        'team': { label: '按团队', icon: '👥' },
        'channel': { label: '按渠道', icon: '📱' },
        'region': { label: '按地区', icon: '🗺️' }
    };

    return dimensions[dimension] || { label: '未知', icon: '❓' };
}

// ==================== 导出所有函数 ====================

window.analyticsIntegration = {
    // 数据获取
    getDashboardData,
    getTodaySnapshot,
    getSalesAnalysis,
    getCustomerAnalysis,
    getProductAnalysis,
    getConversionAnalysis,
    getSalesForecast,
    getChurnPrediction,
    getComparisonAnalysis,
    generateReport,
    
    // 数据导出
    exportDataToCSV,
    downloadCSV,
    downloadJSON,
    
    // 数据格式化
    formatAmount,
    formatLargeNumber,
    formatPercentage,
    formatTrend,
    formatKPICard,
    formatChartData,
    generateColors,
    
    // 实时更新
    startAutoRefresh,
    stopAutoRefresh,
    manualRefresh,
    
    // UI 交互
    getDateRangeOptions,
    switchDateRange,
    switchDimension
};

/**
 * 数据分析集成 - 快速参考和示例
 * 提供常见场景示例和便捷工具函数
 * @version 1.0.0
 */

// ============ 快速参考函数 ============

/**
 * 快速获取仪表板数据
 */
async function quickGetDashboard() {
    const dashboard = await getDashboardData();
    if (dashboard) {
        console.log('仪表板数据加载成功');
        console.log('KPIs:', dashboard.kpis);
        console.log('趋势:', dashboard.trends);
    }
    return dashboard;
}

/**
 * 快速获取本月销售数据
 */
async function quickGetMonthlySales() {
    const sales = await getSalesAnalysis({ period: 'month' });
    console.log('本月销售总额:', formatAmount(sales.totalSales));
    return sales;
}

/**
 * 快速获取本月客户数据
 */
async function quickGetMonthlyCustomers() {
    const customers = await getCustomerAnalysis({ period: 'month' });
    console.log('新增客户:', customers.newCustomers);
    console.log('活跃客户:', customers.activeCustomers);
    return customers;
}

/**
 * 快速获取产品排行
 */
async function quickGetTopProducts() {
    const products = await getProductAnalysis();
    const topProducts = products.topProducts || [];
    console.log('热卖产品:', topProducts.slice(0, 5));
    return topProducts;
}

/**
 * 快速获取转化率
 */
async function quickGetConversionRate() {
    const conversion = await getConversionAnalysis();
    console.log('线索转客户:', formatPercentage(conversion.leadToCustomer));
    console.log('报价转成交:', formatPercentage(conversion.quoteToDeal));
    return conversion;
}

/**
 * 快速获取销售预测
 */
async function quickGetSalesForecast() {
    const forecast = await getSalesForecast({ days: 30 });
    console.log('销售预测:', forecast.forecast);
    console.log('预测趋势:', forecast.trend);
    return forecast;
}

/**
 * 快速获取风险客户
 */
async function quickGetRiskCustomers() {
    const churn = await getChurnPrediction();
    console.log('风险客户数:', churn.riskCustomers.length);
    console.log('流失率:', formatPercentage(churn.churnRate));
    return churn;
}

// ============ 常见场景示例 ============

/**
 * 场景1: 初始化仪表板
 */
async function initializeDashboard() {
    try {
        if (window.UI && window.UI.showLoading) UI.showLoading();

        const dashboard = await getDashboardData();
        if (!dashboard) return;

        // 更新KPI卡片
        updateKPICards(dashboard.kpis);
        
        // 更新趋势图表
        updateTrendCharts(dashboard.trends);
        
        // 显示热门销售员
        renderTopPerformers(dashboard.topPerformers);
        
        // 显示最近活动
        renderRecentActivity(dashboard.recentActivity);
        
        // 显示预警信息
        if (dashboard.alerts && dashboard.alerts.length > 0) {
            showAlerts(dashboard.alerts);
        }

        if (window.UI && window.UI.hideLoading) UI.hideLoading();
    } catch (error) {
        console.error('初始化仪表板失败:', error);
    }
}

/**
 * 场景2: 销售分析报告
 */
async function generateSalesReport() {
    try {
        const sales = await getSalesAnalysis({ period: 'month' });
        const comparison = await getComparisonAnalysis({ type: 'monthOverMonth' });
        
        const report = {
            period: '本月',
            totalSales: sales.totalSales,
            totalSalesFormatted: formatAmount(sales.totalSales),
            trend: comparison.percentageChange,
            trendFormatted: formatPercentage(comparison.percentageChange / 100),
            topProducts: sales.topProducts.slice(0, 5),
            categoryBreakdown: sales.salesByCategory
        };

        console.log('销售报告:', report);
        return report;
    } catch (error) {
        console.error('生成销售报告失败:', error);
    }
}

/**
 * 场景3: 客户分析仪表板
 */
async function showCustomerAnalytics() {
    try {
        const customers = await getCustomerAnalysis();
        const churn = await getChurnPrediction();
        
        const analytics = {
            totalCustomers: customers.totalCustomers,
            newThisMonth: customers.newCustomers,
            activeCustomers: customers.activeCustomers,
            vipCustomers: customers.vipCustomers,
            churnRate: formatPercentage(customers.churnRate),
            retention: formatPercentage(customers.customerRetention),
            lifetimeValue: formatAmount(customers.customerLifetimeValue),
            riskCustomers: churn.riskCustomers.length
        };

        console.table(analytics);
        return analytics;
    } catch (error) {
        console.error('获取客户分析失败:', error);
    }
}

/**
 * 场景4: 销售漏斗分析
 */
async function analyzeSalesFunnel() {
    try {
        const conversion = await getConversionAnalysis();
        
        const funnel = {
            views: 1000,  // 假设基数
            leads: Math.round(1000 * conversion.viewToLead),
            customers: Math.round(1000 * conversion.viewToLead * conversion.leadToCustomer),
            deals: Math.round(1000 * conversion.viewToLead * conversion.leadToCustomer * conversion.quoteToDeal),
            viewToLeadRate: formatPercentage(conversion.viewToLead),
            leadToCustomerRate: formatPercentage(conversion.leadToCustomer),
            quoteToDealRate: formatPercentage(conversion.quoteToDeal)
        };

        console.log('销售漏斗:', funnel);
        return funnel;
    } catch (error) {
        console.error('分析销售漏斗失败:', error);
    }
}

/**
 * 场景5: 产品性能对比
 */
async function compareProductPerformance() {
    try {
        const products = await getProductAnalysis();
        
        const performance = {
            topPerformers: products.topProducts.slice(0, 3),
            poorPerformers: products.slowMovingProducts.slice(0, 3),
            inventoryAlert: Object.entries(products.inventoryStatus)
                .filter(([_, status]) => status === 'low')
                .map(([product]) => product)
        };

        console.log('产品性能对比:', performance);
        return performance;
    } catch (error) {
        console.error('获取产品性能数据失败:', error);
    }
}

/**
 * 场景6: 今日业务总结
 */
async function getDailySummary() {
    try {
        const today = await getTodaySnapshot();
        
        const summary = {
            newLeads: today.newLeads,
            customerVisits: today.customerVisits,
            dealsClosedToday: today.dealsClosedToday,
            salesAmount: formatAmount(today.salesAmountToday),
            conversionRate: formatPercentage(today.conversionRateToday)
        };

        console.log('今日业务总结:');
        console.table(summary);
        return summary;
    } catch (error) {
        console.error('获取今日总结失败:', error);
    }
}

/**
 * 场景7: 数据导出
 */
async function exportAnalyticsData() {
    try {
        const sales = await getSalesAnalysis({ period: 'month' });
        const customers = await getCustomerAnalysis();
        const products = await getProductAnalysis();

        // 组合数据
        const allData = {
            exportTime: new Date().toISOString(),
            sales: sales,
            customers: customers,
            products: products
        };

        // 导出CSV
        const csv = exportDataToCSV(allData.sales.topProducts, 'top_products.csv');
        downloadCSV(csv, `销售数据_${new Date().getTime()}.csv`);

        // 或导出JSON
        downloadJSON(allData, `分析数据_${new Date().getTime()}.json`);

        console.log('数据导出成功');
    } catch (error) {
        console.error('导出数据失败:', error);
    }
}

/**
 * 场景8: 实时数据刷新
 */
let dashboardRefreshTimer = null;

function startDashboardRefresh() {
    dashboardRefreshTimer = startAutoRefresh(async () => {
        const dashboard = await getDashboardData();
        if (dashboard) {
            updateDashboardUI(dashboard);
        }
    }, 60000); // 每分钟刷新一次

    console.log('仪表板自动刷新已启动');
}

function stopDashboardRefresh() {
    stopAutoRefresh(dashboardRefreshTimer);
    console.log('仪表板自动刷新已停止');
}

/**
 * 场景9: 性能指标对标
 */
async function benchmarkMetrics() {
    try {
        const current = await getComparisonAnalysis({ type: 'monthOverMonth' });
        
        const benchmark = {
            salesGrowth: formatPercentage(current.percentageChange / 100),
            trend: current.trend,
            status: current.percentageChange > 0 ? '增长' : 
                   current.percentageChange < 0 ? '下降' : '持平',
            actionRequired: current.percentageChange < 0
        };

        console.log('性能对标:', benchmark);
        return benchmark;
    } catch (error) {
        console.error('获取性能对标数据失败:', error);
    }
}

/**
 * 场景10: 生成月度报告
 */
async function generateMonthlyReport() {
    try {
        // 获取各类数据
        const sales = await getSalesAnalysis({ period: 'month' });
        const customers = await getCustomerAnalysis();
        const products = await getProductAnalysis();
        const conversion = await getConversionAnalysis();
        const comparison = await getComparisonAnalysis({ type: 'monthOverMonth' });

        // 生成报告
        const report = {
            title: '月度业务报告',
            date: new Date().toLocaleDateString('zh-CN'),
            summary: {
                totalSales: formatAmount(sales.totalSales),
                growthRate: formatPercentage(comparison.percentageChange / 100),
                totalCustomers: customers.totalCustomers,
                newCustomers: customers.newCustomers,
                conversionRate: formatPercentage(conversion.leadToCustomer)
            },
            highlights: {
                topProduct: sales.topProducts[0],
                bestPerformer: 'Sales Team Lead',
                alert: 'Low inventory on fast-moving products'
            },
            metrics: {
                sales: sales.totalSales,
                customers: customers.totalCustomers,
                retention: customers.customerRetention,
                churnRate: customers.churnRate
            }
        };

        // 生成正式报告
        const generatedReport = await generateReport('monthly', {
            title: report.title,
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date()
        });

        console.log('月度报告生成成功:', report);
        return { report, generatedReport };
    } catch (error) {
        console.error('生成月度报告失败:', error);
    }
}

// ============ 辅助渲染函数 ============

/**
 * 更新KPI卡片
 */
function updateKPICards(kpis) {
    const kpiCards = Object.entries(kpis).map(([key, value]) => {
        return formatKPICard(key, value);
    });
    console.log('KPI卡片已更新:', kpiCards);
}

/**
 * 更新趋势图表
 */
function updateTrendCharts(trends) {
    const chartData = formatChartData(trends, 'line');
    console.log('趋势图表数据:', chartData);
}

/**
 * 渲染热门销售员
 */
function renderTopPerformers(performers) {
    console.log('热门销售员:', performers);
}

/**
 * 渲染最近活动
 */
function renderRecentActivity(activities) {
    console.log('最近活动:', activities);
}

/**
 * 显示预警
 */
function showAlerts(alerts) {
    alerts.forEach(alert => {
        console.warn('⚠️ 预警:', alert.message);
    });
}

/**
 * 更新仪表板UI
 */
function updateDashboardUI(dashboard) {
    updateKPICards(dashboard.kpis);
    updateTrendCharts(dashboard.trends);
    console.log('仪表板UI已更新');
}

// ============ 导出所有快速参考函数 ============

window.analyticsQuickRef = {
    // 快速获取
    quickGetDashboard,
    quickGetMonthlySales,
    quickGetMonthlyCustomers,
    quickGetTopProducts,
    quickGetConversionRate,
    quickGetSalesForecast,
    quickGetRiskCustomers,
    
    // 场景
    initializeDashboard,
    generateSalesReport,
    showCustomerAnalytics,
    analyzeSalesFunnel,
    compareProductPerformance,
    getDailySummary,
    exportAnalyticsData,
    startDashboardRefresh,
    stopDashboardRefresh,
    benchmarkMetrics,
    generateMonthlyReport
};


# 数据分析和仪表板前后端集成指南

## 概述

本指南说明如何在 dashboard.html 和 analytics.html 等数据分析页面中集成 `analytics-integration.js` 脚本，以实现与后端 API 的无缝连接，展示实时的业务数据、图表和分析报告。

## 快速开始

### 1. 引入脚本

在 HTML 页面的 `<head>` 或 `<body>` 末尾引入集成脚本：

```html
<!-- API 客户端（必须） -->
<script src="../assets/js/api-client.js"></script>

<!-- 数据分析集成脚本 -->
<script src="../assets/js/analytics-integration.js"></script>

<!-- 可选：快速参考脚本（包含示例） -->
<script src="../assets/js/analytics-integration-quick-ref.js"></script>

<!-- 可选：图表库（用于渲染图表） -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@3/dist/chart.min.js"></script>
```

### 2. 初始化页面

页面加载时，调用集成函数来加载数据：

```javascript
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化仪表板
    const dashboard = await getDashboardData();
    
    if (dashboard) {
        // 更新KPI卡片
        updateKPIDisplay(dashboard.kpis);
        
        // 更新图表
        updateCharts(dashboard.trends);
        
        // 显示其他信息
        displayAlerts(dashboard.alerts);
        displayTopPerformers(dashboard.topPerformers);
    }
    
    // 启动自动刷新（可选）
    startAutoRefresh(async () => {
        const updated = await getDashboardData();
        updateKPIDisplay(updated.kpis);
    }, 60000); // 每分钟刷新
});
```

## API 函数参考

### 仪表板数据获取

#### 获取仪表板主要数据
```javascript
const dashboard = await getDashboardData();
// 返回：{
//   kpis: {...},           // 关键指标
//   trends: [...],         // 趋势数据
//   topPerformers: [...],  // 顶级销售员
//   alerts: [...],         // 预警信息
//   recentActivity: [...], // 最近活动
//   forecast: {...}        // 预测数据
// }
```

#### 获取今日数据概览
```javascript
const today = await getTodaySnapshot();
// 返回：{
//   newLeads: 5,
//   customerVisits: 3,
//   dealsClosedToday: 1,
//   salesAmountToday: 225000,
//   conversionRateToday: 0.35
// }
```

### 销售分析

#### 获取销售分析数据
```javascript
const sales = await getSalesAnalysis({
    period: 'month',      // day|week|month|quarter|year
    dimension: 'total'    // total|product|team|channel
});

// 返回：{
//   totalSales: 2847500,
//   salesTrend: [...],           // 趋势数据
//   salesByCategory: [...],      // 按分类统计
//   salesByChannel: [...],       // 按渠道统计
//   topProducts: [...],          // 热卖产品
//   comparison: {...}            // 对比数据
// }
```

### 客户分析

#### 获取客户分析数据
```javascript
const customers = await getCustomerAnalysis({
    period: 'month'
});

// 返回：{
//   totalCustomers: 1250,
//   newCustomers: 45,
//   activeCustomers: 890,
//   vipCustomers: 120,
//   churnRate: 0.05,
//   customerLifetimeValue: 18254,
//   customerRetention: 0.95,
//   customerSegmentation: [...]
// }
```

### 产品分析

#### 获取产品分析数据
```javascript
const products = await getProductAnalysis({
    period: 'month'
});

// 返回：{
//   totalProducts: 247,
//   topProducts: [...],          // 热卖产品
//   slowMovingProducts: [...],   // 滞销产品
//   productRevenue: [...],       // 产品收入
//   inventoryStatus: {...}       // 库存状态
// }
```

### 转化率分析

#### 获取转化率数据
```javascript
const conversion = await getConversionAnalysis();

// 返回：{
//   leadToCustomer: 0.45,        // 线索转客户率
//   quoteToDeal: 0.65,           // 报价转成交率
//   viewToLead: 0.08,            // 浏览转线索率
//   funnelData: [...],           // 漏斗数据
//   conversionBySource: [...],   // 按渠道转化率
//   conversionTrend: [...]       // 转化率趋势
// }
```

### 预测和预警

#### 获取销售预测
```javascript
const forecast = await getSalesForecast({
    days: 30,
    confidence: 0.95
});

// 返回：{
//   forecast: [...],
//   confidence: 0.95,
//   trend: 'up',             // up|down|stable
//   expectedRange: {min: ..., max: ...}
// }
```

#### 获取客户流失预测
```javascript
const churn = await getChurnPrediction();

// 返回：{
//   riskCustomers: [...],
//   churnRate: 0.08,
//   predictions: [...],
//   recommendations: [...]
// }
```

### 对比分析

#### 获取数据对比
```javascript
const comparison = await getComparisonAnalysis({
    type: 'monthOverMonth'  // monthOverMonth|yearOverYear|quarterOverQuarter
});

// 返回：{
//   current: {...},
//   previous: {...},
//   change: {...},
//   percentageChange: 12.5,
//   trend: 'stable'
// }
```

### 报告生成

#### 生成分析报告
```javascript
const report = await generateReport('monthly', {
    title: '月度销售报告',
    startDate: new Date(2024, 0, 1),
    endDate: new Date()
});
```

## 数据导出

### 导出为 CSV
```javascript
const data = [
    { name: '产品A', sales: 100000, margin: 0.30 },
    { name: '产品B', sales: 150000, margin: 0.25 }
];

const csv = exportDataToCSV(data);
downloadCSV(csv, 'products_report.csv');
```

### 导出为 JSON
```javascript
const data = {
    period: '2024-01',
    totalSales: 2847500,
    metrics: {...}
};

downloadJSON(data, 'analytics_report.json');
```

## 数据格式化

### 格式化金额
```javascript
const formatted = formatAmount(2847500);
// 返回：'¥2,847,500.00'
```

### 格式化大数字
```javascript
const formatted = formatLargeNumber(2847500);
// 返回：'284.75万'
```

### 格式化百分比
```javascript
const formatted = formatPercentage(0.35);
// 返回：'35.0%'
```

### 格式化趋势
```javascript
const trend = formatTrend(2847500, 2530000);  // 当前值，上月值
// 返回：{
//   trend: 'up',
//   percentageChange: '12.5',
//   arrow: '↗',
//   class: 'text-green-600'
// }
```

### 格式化KPI卡片
```javascript
const kpi = formatKPICard('销售总额', 2847500, {
    unit: 'amount',
    previousValue: 2530000
});
```

### 格式化图表数据
```javascript
const rawData = [
    { label: '1月', value: 100 },
    { label: '2月', value: 150 }
];

const chartData = formatChartData(rawData, 'line');
// 返回：Chart.js 格式的数据对象
```

## 实时数据更新

### 启动自动刷新
```javascript
const timerId = startAutoRefresh(async () => {
    const dashboard = await getDashboardData();
    updateDashboardUI(dashboard);
}, 60000); // 每分钟刷新

// 停止刷新
stopAutoRefresh(timerId);
```

### 手动刷新
```javascript
await manualRefresh(async () => {
    const dashboard = await getDashboardData();
    updateDashboardUI(dashboard);
});
```

## UI 交互函数

### 日期范围选项
```javascript
const options = getDateRangeOptions();
// 返回包含：今天、本周、本月、本季度、本年

const range = switchDateRange('month');
// 返回：{startDate: Date, endDate: Date}
```

### 维度切换
```javascript
const dim = switchDimension('product');
// 返回：{label: '按产品', icon: '📦'}
```

## 完整集成示例

### 仪表板页面 (dashboard.html)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="../assets/js/api-client.js"></script>
    <script src="../assets/js/analytics-integration.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3/dist/chart.min.js"></script>
</head>
<body>
    <!-- KPI卡片 -->
    <div id="kpiContainer" class="grid grid-cols-4 gap-4"></div>
    
    <!-- 图表 -->
    <div id="trendChart"></div>
    
    <!-- 热门销售员 -->
    <div id="topPerformers"></div>
    
    <script>
        document.addEventListener('DOMContentLoaded', initializeDashboard);
        
        async function initializeDashboard() {
            const dashboard = await getDashboardData();
            
            if (!dashboard) return;
            
            // 渲染KPI卡片
            renderKPICards(dashboard.kpis);
            
            // 渲染趋势图表
            renderTrendChart(dashboard.trends);
            
            // 渲染热门销售员
            renderTopPerformers(dashboard.topPerformers);
            
            // 启动自动刷新
            startAutoRefresh(async () => {
                const updated = await getDashboardData();
                renderKPICards(updated.kpis);
            }, 60000);
        }
        
        function renderKPICards(kpis) {
            const container = document.getElementById('kpiContainer');
            container.innerHTML = Object.entries(kpis).map(([key, value]) => `
                <div class="card">
                    <h3>${key}</h3>
                    <div class="text-2xl">${formatLargeNumber(value)}</div>
                </div>
            `).join('');
        }
        
        function renderTrendChart(trends) {
            const data = formatChartData(trends, 'line');
            const ctx = document.getElementById('trendChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: data
            });
        }
        
        function renderTopPerformers(performers) {
            const container = document.getElementById('topPerformers');
            container.innerHTML = performers.map(p => `
                <div class="performer">
                    <span>${p.name}</span>
                    <span>${formatAmount(p.sales)}</span>
                </div>
            `).join('');
        }
    </script>
</body>
</html>
```

### 分析页面 (analytics.html)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="../assets/js/api-client.js"></script>
    <script src="../assets/js/analytics-integration.js"></script>
    <script src="../assets/js/analytics-integration-quick-ref.js"></script>
</head>
<body>
    <!-- 时间范围选择 -->
    <div id="dateRange"></div>
    
    <!-- 分析数据 -->
    <div id="analyticsContent"></div>
    
    <!-- 导出按钮 -->
    <button onclick="exportData()">导出数据</button>
    
    <script>
        let currentPeriod = 'month';
        
        document.addEventListener('DOMContentLoaded', async () => {
            renderDateRangeOptions();
            await loadAnalytics(currentPeriod);
        });
        
        function renderDateRangeOptions() {
            const options = getDateRangeOptions();
            const container = document.getElementById('dateRange');
            
            container.innerHTML = options.map(opt => `
                <button onclick="switchPeriod('${opt.value}')">
                    ${opt.label}
                </button>
            `).join('');
        }
        
        async function switchPeriod(period) {
            currentPeriod = period;
            await loadAnalytics(period);
        }
        
        async function loadAnalytics(period) {
            const sales = await getSalesAnalysis({ period });
            const customers = await getCustomerAnalysis({ period });
            const products = await getProductAnalysis({ period });
            
            const html = `
                <div class="section">
                    <h2>销售分析</h2>
                    <p>总销售额：${formatAmount(sales.totalSales)}</p>
                    <ul>
                        ${sales.topProducts.map(p => `
                            <li>${p.name}: ${formatAmount(p.sales)}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="section">
                    <h2>客户分析</h2>
                    <ul>
                        <li>总客户数：${customers.totalCustomers}</li>
                        <li>新增客户：${customers.newCustomers}</li>
                        <li>活跃客户：${customers.activeCustomers}</li>
                    </ul>
                </div>
                
                <div class="section">
                    <h2>产品分析</h2>
                    <ul>
                        <li>总产品数：${products.totalProducts}</li>
                        <li>热卖产品：${products.topProducts.length}</li>
                        <li>滞销产品：${products.slowMovingProducts.length}</li>
                    </ul>
                </div>
            `;
            
            document.getElementById('analyticsContent').innerHTML = html;
        }
        
        async function exportData() {
            await exportAnalyticsData();
        }
    </script>
</body>
</html>
```

## 常见问题

### Q1: 如何实时更新仪表板数据？
**A**: 使用 `startAutoRefresh()` 函数：
```javascript
const timerId = startAutoRefresh(async () => {
    const dashboard = await getDashboardData();
    updateDashboardUI(dashboard);
}, 60000); // 每60秒刷新一次
```

### Q2: 如何自定义图表样式？
**A**: 使用 `formatChartData()` 返回的数据，配合 Chart.js 的选项：
```javascript
const data = formatChartData(rawData, 'line');
const ctx = document.getElementById('myChart').getContext('2d');
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: { display: true }
        }
    }
});
```

### Q3: 如何处理 API 错误？
**A**: 所有函数都返回 null 当出错时：
```javascript
const data = await getDashboardData();
if (!data) {
    console.log('获取数据失败，请稍后重试');
}
```

### Q4: 如何导出大量数据？
**A**: 使用分页或流式导出：
```javascript
const sales = await getSalesAnalysis();
const csv = exportDataToCSV(sales.topProducts);
downloadCSV(csv, 'top_products.csv');
```

## 最佳实践

1. **性能优化**
   - 避免频繁请求，使用缓存
   - 使用自动刷新而不是手动频繁刷新
   - 对大数据集进行分页

2. **用户体验**
   - 在加载数据时显示加载动画
   - 提供明确的错误提示
   - 自动保存用户选择的时间范围

3. **数据安全**
   - 验证所有用户输入
   - 使用 HTTPS 传输敏感数据
   - 定期检查 Token 有效期

4. **可维护性**
   - 为所有自定义函数添加注释
   - 使用一致的命名规范
   - 模块化代码结构

## API 端点映射

| 操作 | 方法 | 端点 |
|------|------|------|
| 仪表板 | GET | `/api/analytics/dashboard` |
| 销售分析 | GET | `/api/analytics/sales` |
| 客户分析 | GET | `/api/analytics/customer` |
| 产品分析 | GET | `/api/analytics/product` |
| 转化率 | GET | `/api/analytics/conversion-rate` |
| 销售预测 | GET | `/api/analytics/forecast/sales` |
| 流失预测 | GET | `/api/analytics/forecast/churn` |
| 对比数据 | GET | `/api/analytics/comparison` |
| 报告生成 | GET | `/api/analytics/report/{type}` |

## 后续步骤

1. 在 dashboard.html 中集成仪表板数据
2. 在 analytics.html 中集成详细分析功能
3. 配置图表库（Chart.js 或 ECharts）
4. 实现数据导出功能
5. 添加自定义报告生成
6. 集成权限控制和角色过滤

---

**文档版本**: 1.0  
**最后更新**: 2024年

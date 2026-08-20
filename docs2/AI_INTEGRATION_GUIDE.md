# ShopPro AI 集成指南

## 📋 目录

1. [快速开始](#快速开始)
2. [API集成](#api集成)
3. [聊天功能集成](#聊天功能集成)
4. [AI分析功能](#ai分析功能)
5. [话术推荐系统](#话术推荐系统)
6. [高级功能](#高级功能)
7. [错误处理](#错误处理)
8. [最佳实践](#最佳实践)

---

## 快速开始

### 1. 引入所需脚本

在HTML文件中按以下顺序引入脚本：

```html
<!-- 基础脚本 -->
<script src="../assets/js/utils.js"></script>
<script src="../assets/js/ui-components.js"></script>
<script src="../assets/js/api-client.js"></script>

<!-- AI集成脚本 -->
<script src="../assets/js/ai-integration.js"></script>
<script src="../assets/js/ai-integration-quick-ref.js"></script>
```

### 2. 全局对象说明

加载后，您可以访问两个全局对象：

```javascript
// 主AI集成对象 - 包含所有底层函数
window.aiIntegration

// 快速参考对象 - 包含场景示例和快速工具
window.aiQuickRef
```

---

## API集成

### API服务地址

```javascript
// 主API服务
const apiURL = window.location.origin + '/api';

// AI服务（Python Flask）
const aiURL = 'http://localhost:5000/api';
```

### 初始化检查

```javascript
// 检查AI服务健康状态
const isHealthy = await window.aiIntegration.checkAIServiceHealth();

if (isHealthy) {
    console.log('✅ AI服务运行正常');
} else {
    console.log('❌ AI服务不可用');
}
```

---

## 聊天功能集成

### ai.html 聊天页面集成

#### 1. 发送聊天消息

```javascript
// 发送单条消息
async function handleSendMessage(message) {
    const result = await window.aiIntegration.sendChatMessage(message, {
        sessionId: window.aiIntegration.generateSessionId(),
        userId: window.aiIntegration.getCurrentUserId(),
        channel: 'web'
    });
    
    if (result.success) {
        // 在UI中显示AI回复
        displayBotMessage(result.botResponse);
    } else {
        showErrorMessage('发送失败: ' + result.error);
    }
}
```

#### 2. 使用快速场景

```javascript
// 使用快速参考中的聊天场景
async function sendQuickReply(message) {
    const botReply = await aiQuickRef.Chat.sendAndReply(message);
    // 返回结果已打印到console
    return botReply;
}
```

#### 3. 管理会话

```javascript
// 获取会话历史
const history = await window.aiIntegration.getChatHistory(sessionId);

// 结束会话
await window.aiIntegration.endChatSession(sessionId);

// 清除会话
window.aiIntegration.clearSession();
```

#### 4. 知识库搜索

```javascript
// 搜索知识库
const results = await window.aiIntegration.searchKnowledge('销售话术', 10);

if (results.success) {
    results.results.forEach(item => {
        console.log(`${item.title}: ${item.content}`);
    });
}
```

#### 完整示例 - ai.html集成

```javascript
// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 检查服务
    const isHealthy = await window.aiIntegration.checkAIServiceHealth();
    
    if (!isHealthy) {
        showErrorMessage('AI服务暂不可用');
        return;
    }
    
    // 初始化会话
    const sessionId = window.aiIntegration.generateSessionId();
    console.log('会话已创建:', sessionId);
});

// 发送消息处理
async function handleSendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 显示用户消息
    addUserMessage(message);
    input.value = '';
    
    // 调用AI
    window.aiIntegration.showAILoading();
    
    const result = await window.aiIntegration.sendChatMessage(message);
    
    window.aiIntegration.hideAILoading();
    
    if (result.success) {
        addBotMessage(result.botResponse);
    } else {
        addBotMessage('抱歉，请稍后重试: ' + result.error);
    }
}

// 快速建议按钮
async function insertQuickMessage(message) {
    const input = document.getElementById('messageInput');
    input.value = message;
    input.focus();
}
```

---

## AI分析功能

### ai-brain.html 大脑页面集成

#### 1. 客户分析

```javascript
// 分析单个客户
async function analyzeCustomerProfile(customerId) {
    const result = await window.aiIntegration.analyzeCustomer(customerId);
    
    if (result.success) {
        const analysis = result.analysis;
        
        // 展示分析结果
        console.log('客户评分:', analysis.score);
        console.log('客户标签:', analysis.tags);
        console.log('行为模式:', analysis.behavior);
        console.log('个性化建议:', analysis.recommendations);
        
        return analysis;
    }
}

// 快速分析
const analysis = await aiQuickRef.Analysis.quickAnalyzeCustomer('cust_123');
```

#### 2. 销售预测

```javascript
// 预测线索成交概率
async function predictLeadConversion(leadId) {
    const result = await window.aiIntegration.predictSales(leadId);
    
    if (result.success) {
        const pred = result.prediction;
        
        return {
            probability: (pred.conversionProbability * 100).toFixed(1) + '%',
            timeframe: pred.closingTimeframe,
            dealValue: pred.estimatedDealValue,
            risks: pred.riskFactors,
            actions: pred.recommendedActions
        };
    }
}

// 批量预测
const predictions = await window.aiIntegration.batchPredictSales(['lead_1', 'lead_2', 'lead_3']);
```

#### 3. 流失风险分析

```javascript
// 分析客户流失风险
async function analyzeChurnRisk(customerIds) {
    const result = await window.aiIntegration.analyzeChurnRisk(customerIds);
    
    if (result.success) {
        const analysis = result.analysis;
        
        // 按风险级别分类
        console.log('高风险客户:', analysis.highRiskCustomers);
        console.log('中风险客户:', analysis.mediumRiskCustomers);
        console.log('保留策略:', analysis.retentionStrategies);
        
        return analysis;
    }
}
```

#### 4. 话术推荐

```javascript
// 为特定客户推荐话术
async function getRecommendedScript(customerId, scenario = 'general') {
    const result = await window.aiIntegration.recommendScript(customerId, scenario);
    
    if (result.success) {
        const scripts = result.scripts;
        
        return {
            mainScript: scripts.primary,
            alternatives: scripts.alternatives,
            successRate: scripts.successRate + '%',
            usageCount: scripts.usageCount,
            tips: scripts.tips
        };
    }
}

// 支持的场景：'general', 'opening', 'discovery', 'objection', 'closing'
```

#### 完整示例 - ai-brain.html集成

```javascript
// 加载AI建议
async function loadAIInsights() {
    // 1. 实时建议
    const insights = await aiQuickRef.Analysis.quickAnalyzeCustomer('current_customer_id');
    
    // 2. 销售预测
    const prediction = await aiQuickRef.Analysis.predictSalesSuccess('current_lead_id');
    
    // 3. 流失风险
    const churnRisks = await aiQuickRef.Analysis.analyzeChurnRisk(['cust_1', 'cust_2']);
    
    // 更新UI
    updateAIInsightsPanel({
        insights,
        prediction,
        churnRisks
    });
}

// 刷新按钮处理
async function refreshAIRecommendations() {
    window.aiIntegration.showAILoading();
    await loadAIInsights();
    window.aiIntegration.hideAILoading();
    window.aiIntegration.showAIMessage('建议已更新', 'success');
}
```

---

## 话术推荐系统

### ai-scripts.html 话术管理页面集成

#### 1. 初始化话术库

```javascript
// 初始化话术场景
async function initScriptLibrary() {
    const scenarios = await aiQuickRef.Scripts.initScriptLibrary();
    
    // scenarios 包含：
    // - opening: 开场白
    // - discovery: 需求挖掘
    // - objection: 异议处理
    // - closing: 成交促进
    // - general: 通用话术
    
    return scenarios;
}
```

#### 2. 获取场景话术

```javascript
// 获取特定场景的推荐话术
async function getScriptByScenario(customerId, scenario) {
    const scripts = await aiQuickRef.Scripts.getScriptByScenario(customerId, scenario);
    
    if (scripts) {
        return {
            primary: scripts.primary,           // 主推荐话术
            alternatives: scripts.alternatives, // 备选方案
            successRate: scripts.successRate,   // 成功率
            usageCount: scripts.usageCount,     // 使用次数
            tips: scripts.tips                  // 使用建议
        };
    }
}
```

#### 3. 批量管理话术

```javascript
// 批量获取多个客户的话术
async function batchGetScripts(customerIds) {
    const scripts = await aiQuickRef.Scripts.batchGetScripts(customerIds);
    
    // 返回 [{customerId: 'c1', script: '...'}, ...]
    return scripts;
}
```

#### 完整示例 - ai-scripts.html集成

```javascript
// 页面加载
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化话术场景选项卡
    const scenarios = await aiQuickRef.Scripts.initScriptLibrary();
    
    scenarios.forEach(scenario => {
        const tab = createScenarioTab(scenario);
        document.getElementById('scenarioTabs').appendChild(tab);
    });
});

// 选择场景后加载话术
async function onScenarioChange(scenario) {
    const customerId = getCurrentCustomerId();
    
    window.aiIntegration.showAILoading();
    
    const scripts = await aiQuickRef.Scripts.getScriptByScenario(customerId, scenario);
    
    window.aiIntegration.hideAILoading();
    
    if (scripts) {
        displayScripts(scripts);
    }
}

// 使用话术
function useScript(scriptText) {
    // 复制到剪贴板或其他操作
    copyToClipboard(scriptText);
    window.aiIntegration.showAIMessage('话术已复制', 'success');
}
```

---

## 高级功能

### 1. 客户生命周期价值 (CLV) 预测

```javascript
async function predictCLV(customers) {
    const result = await window.aiIntegration.predictCLV(customers);
    
    if (result.success) {
        return {
            predictions: result.predictions,
            averageCLV: result.summary.averageCLV,
            totalValue: result.summary.totalPredictedValue,
            topCustomers: result.summary.topValueCustomers
        };
    }
}

// 快速调用
const clvAnalysis = await aiQuickRef.DataAnalysis.quickCLVAnalysis(customerList);
```

### 2. 销售漏斗分析

```javascript
async function analyzeFunnel(funnelData) {
    const result = await window.aiIntegration.analyzeFunnel(funnelData);
    
    if (result.success) {
        return {
            rates: result.analysis.conversionRates,
            bottlenecks: result.analysis.bottlenecks,
            optimizations: result.analysis.optimizations,
            improvements: result.analysis.predictedImprovements
        };
    }
}

// 快速调用
const funnelAnalysis = await aiQuickRef.DataAnalysis.analyzeSalesFunnel(funnelData);
```

### 3. 客户细分

```javascript
async function segmentCustomers(customers) {
    const result = await window.aiIntegration.segmentCustomers(customers);
    
    if (result.success) {
        return {
            segments: result.segments,
            count: result.segmentCount,
            characteristics: result.characteristics
        };
    }
}

// 快速调用
const segments = await aiQuickRef.DataAnalysis.segmentAllCustomers(customerList);
```

### 4. 个性化推荐

```javascript
async function getPersonalizedRecommendations(userId) {
    const result = await window.aiIntegration.getRecommendations(
        userId,
        'product',  // 商品类型
        10,         // 推荐数量
        []          // 交互记录
    );
    
    if (result.success) {
        return result.recommendations;
    }
}
```

### 5. 营销自动化

```javascript
// 创建客户旅程
async function createMarketingJourney() {
    const config = {
        name: '新客户引导旅程',
        stages: [
            { type: 'email', template: 'welcome' },
            { type: 'sms', template: 'offer' },
            { type: 'call', template: 'follow-up' }
        ]
    };
    
    const result = await window.aiIntegration.createCustomerJourney(config);
    return result.journeyId;
}

// 触发客户旅程
async function triggerMarketingJourney(customerId, journeyId) {
    const result = await window.aiIntegration.triggerCustomerJourney(
        customerId,
        journeyId,
        { event: 'purchase_completed' }
    );
    
    return result.status;
}

// 发送智能邮件
async function sendSmartEmail(emailConfig, recipients) {
    const result = await window.aiIntegration.sendSmartEmail(
        emailConfig,
        recipients
    );
    
    return result.trackingId;
}
```

### 6. 数据分析与报表

```javascript
// 创建透视分析
async function createAnalysis(data, config) {
    const result = await window.aiIntegration.createPivotAnalysis(data, config);
    return result;
}

// 生成自定义报表
async function generateReport(config, data) {
    const result = await window.aiIntegration.generateCustomReport(config, data);
    return result.report;
}

// 检测异常
async function detectAnomalies(data, config) {
    const result = await window.aiIntegration.detectAnomalies(data, config);
    return result.anomalies;
}

// 预测趋势
async function predictTrends(data, config) {
    const result = await window.aiIntegration.predictTrends(data, config);
    return {
        forecast: result.forecast,
        confidence: result.confidence,
        trend: result.trend
    };
}
```

---

## 错误处理

### 1. 基础错误处理

```javascript
async function callAIFunction(fn, params) {
    try {
        window.aiIntegration.showAILoading();
        const result = await fn(params);
        
        if (!result.success) {
            window.aiIntegration.showAIMessage(result.error, 'danger');
            return null;
        }
        
        return result;
        
    } catch (error) {
        console.error('AI函数调用错误:', error);
        window.aiIntegration.showAIMessage('发生错误，请稍后重试', 'danger');
        return null;
        
    } finally {
        window.aiIntegration.hideAILoading();
    }
}
```

### 2. 常见错误处理

```javascript
// 客户ID不存在
async function handleAnalyzeCustomer(customerId) {
    if (!customerId) {
        aiQuickRef.Tools.error('请选择客户');
        return;
    }
    
    const result = await window.aiIntegration.analyzeCustomer(customerId);
    
    if (!result.success) {
        if (result.error.includes('不存在')) {
            aiQuickRef.Tools.error('客户不存在');
        } else {
            aiQuickRef.Tools.error('分析失败: ' + result.error);
        }
    }
}

// 网络连接错误
async function checkAIAvailability() {
    const isHealthy = await window.aiIntegration.checkAIServiceHealth();
    
    if (!isHealthy) {
        aiQuickRef.Tools.warning('AI服务暂不可用，请稍后重试');
        return false;
    }
    
    return true;
}
```

### 3. 使用日志记录器

```javascript
// 记录API调用
aiQuickRef.Logger.logAPICall('analyzeCustomer', { customerId: 'c123' });

// 记录成功
aiQuickRef.Logger.logSuccess('analyzeCustomer', analysisResult);

// 记录错误
aiQuickRef.Logger.logError('analyzeCustomer', error);

// 记录数据
aiQuickRef.Logger.logData('客户数据', customerList);
```

---

## 最佳实践

### 1. 用户体验最佳实践

```javascript
// ✅ 好做法：显示加载状态
async function optimizedAICall() {
    window.aiIntegration.showAILoading('正在分析中...');
    
    try {
        const result = await window.aiIntegration.analyzeCustomer(customerId);
        
        if (result.success) {
            window.aiIntegration.showAIMessage('分析完成！', 'success');
            return result;
        }
    } finally {
        window.aiIntegration.hideAILoading();
    }
}

// ❌ 不好做法：没有反馈
async function poorAICall() {
    const result = await window.aiIntegration.analyzeCustomer(customerId);
    // 用户不知道在发生什么
}
```

### 2. 性能优化

```javascript
// ✅ 批量处理而非逐一处理
async function efficientBatchAnalysis(customerIds) {
    // 一次性分析多个客户
    const results = await aiQuickRef.Batch.analyzeCustomers(customerIds);
    return results;
}

// ❌ 低效：逐个分析
async function inefficientAnalysis(customerIds) {
    const results = [];
    for (const id of customerIds) {
        const result = await window.aiIntegration.analyzeCustomer(id);
        results.push(result);
        await delay(100); // 不必要的延迟
    }
}
```

### 3. 会话管理

```javascript
// ✅ 正确的会话处理
document.addEventListener('DOMContentLoaded', () => {
    // 初始化会话
    const sessionId = window.aiIntegration.generateSessionId();
    localStorage.setItem('current_session', sessionId);
});

window.addEventListener('beforeunload', () => {
    // 清理会话
    window.aiIntegration.endChatSession(
        localStorage.getItem('current_session')
    );
});

// ❌ 不正确：重复创建会话
function poorSessionManagement() {
    // 每次调用都创建新会话，造成浪费
    const sessionId = window.aiIntegration.generateSessionId();
}
```

### 4. 缓存和重用

```javascript
// ✅ 缓存分析结果
class CustomerAnalysisCache {
    constructor() {
        this.cache = new Map();
    }
    
    async getAnalysis(customerId) {
        if (this.cache.has(customerId)) {
            return this.cache.get(customerId);
        }
        
        const result = await window.aiIntegration.analyzeCustomer(customerId);
        
        if (result.success) {
            this.cache.set(customerId, result.analysis);
        }
        
        return result;
    }
    
    invalidate(customerId) {
        this.cache.delete(customerId);
    }
}

const analysisCache = new CustomerAnalysisCache();
```

### 5. 监控和日志

```javascript
// ✅ 记录关键操作
async function monitoredAICall(functionName, params) {
    const startTime = Date.now();
    
    aiQuickRef.Logger.logAPICall(functionName, params);
    
    try {
        const result = await window.aiIntegration[functionName](params);
        
        const duration = Date.now() - startTime;
        aiQuickRef.Logger.logSuccess(functionName, {
            ...result,
            duration: `${duration}ms`
        });
        
        return result;
        
    } catch (error) {
        aiQuickRef.Logger.logError(functionName, error);
        throw error;
    }
}
```

---

## 完整集成检查清单

- [ ] 所有脚本已正确引入
- [ ] API客户端已初始化
- [ ] 会话管理已实现
- [ ] 错误处理已覆盖
- [ ] 加载状态已显示
- [ ] 用户反馈已完整
- [ ] 日志记录已启用
- [ ] 性能已优化
- [ ] 缓存已实现
- [ ] 测试已完成

---

## 常见问题 (FAQ)

**Q: 如何获取当前用户ID？**
```javascript
const userId = window.aiIntegration.getCurrentUserId();
```

**Q: 如何生成会话ID？**
```javascript
const sessionId = window.aiIntegration.generateSessionId();
```

**Q: 如何显示加载动画？**
```javascript
window.aiIntegration.showAILoading();
window.aiIntegration.hideAILoading();
```

**Q: 如何显示提示消息？**
```javascript
window.aiIntegration.showAIMessage('消息内容', 'success');
// 类型: success, warning, danger, info
```

**Q: 如何检查AI服务是否运行？**
```javascript
const isHealthy = await window.aiIntegration.checkAIServiceHealth();
```

---

## 联系与支持

如有问题或建议，请参考 `ai-integration-quick-ref.js` 中的快速参考示例。

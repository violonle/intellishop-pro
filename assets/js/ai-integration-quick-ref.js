/**
 * ShopPro AI 集成快速参考
 * 提供常见场景的快速实现示例和工具函数
 * @version 1.0.0
 */

// ==================== 快速场景集合 ====================

/**
 * 场景1: AI聊天快速集成
 * 在ai.html中使用
 */
const ChatScenarios = {
    /**
     * 初始化聊天
     */
    initChat: async function() {
        console.log('初始化AI聊天...');
        
        const sessionId = window.aiIntegration.generateSessionId();
        const userId = window.aiIntegration.getCurrentUserId();
        
        console.log('会话ID:', sessionId);
        console.log('用户ID:', userId);
        
        return { sessionId, userId };
    },

    /**
     * 发送消息并获取回复
     * 用法: await ChatScenarios.sendAndReply('请为我推荐销售话术');
     */
    sendAndReply: async function(message) {
        console.log('📤 发送消息:', message);
        
        window.aiIntegration.showAILoading();
        
        const result = await window.aiIntegration.sendChatMessage(message, {
            sessionId: window.aiIntegration.generateSessionId(),
            userId: window.aiIntegration.getCurrentUserId(),
            channel: 'web'
        });

        window.aiIntegration.hideAILoading();
        
        if (result.success) {
            console.log('✅ AI回复:', result.botResponse);
            return result.botResponse;
        } else {
            console.error('❌ 消息发送失败:', result.error);
            return null;
        }
    },

    /**
     * 获取知识库搜索结果
     * 用法: await ChatScenarios.searchKB('产品优势');
     */
    searchKB: async function(query) {
        console.log('🔍 搜索知识库:', query);
        
        const result = await window.aiIntegration.searchKnowledge(query, 5);
        
        if (result.success) {
            console.log(`找到 ${result.count} 条相关知识:`);
            result.results.forEach((item, idx) => {
                console.log(`${idx + 1}. ${item.title || item.question}`);
            });
            return result.results;
        } else {
            console.error('❌ 搜索失败:', result.error);
            return [];
        }
    }
};

/**
 * 场景2: 客户分析快速集成
 * 在ai-brain.html中使用
 */
const AnalysisScenarios = {
    /**
     * 快速分析客户
     * 用法: await AnalysisScenarios.quickAnalyzeCustomer('cust_123');
     */
    quickAnalyzeCustomer: async function(customerId) {
        console.log('分析客户:', customerId);
        
        window.aiIntegration.showAILoading();
        
        const result = await window.aiIntegration.analyzeCustomer(customerId);
        
        window.aiIntegration.hideAILoading();
        
        if (result.success) {
            console.log('客户分析完成:');
            console.log('- 分数:', result.analysis.score);
            console.log('- 标签:', result.analysis.tags);
            console.log('- 建议:', result.analysis.recommendations);
            return result.analysis;
        } else {
            console.error('❌ 分析失败:', result.error);
            return null;
        }
    },

    /**
     * 推荐销售话术
     * 用法: await AnalysisScenarios.getScriptRecommendation('cust_123', 'opening');
     */
    getScriptRecommendation: async function(customerId, scenario = 'general') {
        console.log('推荐话术 - 客户:', customerId, '场景:', scenario);
        
        const result = await window.aiIntegration.recommendScript(customerId, scenario);
        
        if (result.success) {
            console.log('推荐话术:');
            console.log('📝 主话术:', result.scripts.primary);
            console.log('💡 成功率:', result.scripts.successRate, '%');
            console.log('📊 使用次数:', result.scripts.usageCount);
            console.log('💬 建议:', result.scripts.tips);
            return result.scripts;
        } else {
            console.error('❌ 推荐失败:', result.error);
            return null;
        }
    },

    /**
     * 预测销售成功率
     * 用法: await AnalysisScenarios.predictSalesSuccess('lead_456');
     */
    predictSalesSuccess: async function(leadId) {
        console.log('预测销售成功率 - 线索:', leadId);
        
        window.aiIntegration.showAILoading();
        
        const result = await window.aiIntegration.predictSales(leadId);
        
        window.aiIntegration.hideAILoading();
        
        if (result.success) {
            const pred = result.prediction;
            console.log('销售预测:');
            console.log('📈 成交概率:', (pred.conversionProbability * 100).toFixed(1), '%');
            console.log('⏱️  成交周期:', pred.closingTimeframe);
            console.log('💰 预计合同额:', pred.estimatedDealValue);
            console.log('⚠️  风险因素:', pred.riskFactors);
            console.log('🎯 推荐行动:', pred.recommendedActions);
            return pred;
        } else {
            console.error('❌ 预测失败:', result.error);
            return null;
        }
    },

    /**
     * 分析流失风险
     * 用法: await AnalysisScenarios.analyzeChurnRisk(['cust_1', 'cust_2', 'cust_3']);
     */
    analyzeChurnRisk: async function(customerIds) {
        console.log('分析客户流失风险:', customerIds.length, '个客户');
        
        const result = await window.aiIntegration.analyzeChurnRisk(customerIds);
        
        if (result.success) {
            const analysis = result.analysis;
            console.log('流失风险分析:');
            console.log('🔴 高风险客户:', analysis.highRiskCustomers.length);
            console.log('🟡 中风险客户:', analysis.mediumRiskCustomers.length);
            console.log('🟢 低风险客户:', analysis.lowRiskCustomers.length);
            console.log('💡 保留策略:', analysis.retentionStrategies);
            return analysis;
        } else {
            console.error('❌ 分析失败:', result.error);
            return null;
        }
    }
};

/**
 * 场景3: 脚本管理快速集成
 * 在ai-scripts.html中使用
 */
const ScriptScenarios = {
    /**
     * 初始化话术库
     */
    initScriptLibrary: async function() {
        console.log('初始化话术库...');
        
        // 定义话术场景
        const scenarios = [
            { id: 'opening', label: '开场白', icon: '🎯' },
            { id: 'discovery', label: '需求挖掘', icon: '🔍' },
            { id: 'objection', label: '异议处理', icon: '💪' },
            { id: 'closing', label: '成交促进', icon: '🎊' },
            { id: 'general', label: '通用话术', icon: '💬' }
        ];
        
        console.log('话术场景:', scenarios);
        return scenarios;
    },

    /**
     * 获取某个场景的话术
     * 用法: await ScriptScenarios.getScriptByScenario('cust_123', 'objection');
     */
    getScriptByScenario: async function(customerId, scenario) {
        console.log(`获取 ${scenario} 话术 - 客户:`, customerId);
        
        const result = await window.aiIntegration.recommendScript(customerId, scenario);
        
        if (result.success) {
            const scripts = result.scripts;
            console.log(`📝 ${scenario} 场景推荐话术:`);
            console.log('主话术:', scripts.primary);
            console.log('备选方案:', scripts.alternatives);
            console.log('成功率:', scripts.successRate, '%');
            return scripts;
        } else {
            console.error('获取话术失败:', result.error);
            return null;
        }
    },

    /**
     * 批量获取多个客户的话术
     * 用法: await ScriptScenarios.batchGetScripts(['cust_1', 'cust_2']);
     */
    batchGetScripts: async function(customerIds) {
        console.log('批量获取话术:', customerIds.length, '个客户');
        
        const scripts = [];
        
        for (const custId of customerIds) {
            const result = await window.aiIntegration.recommendScript(custId, 'general');
            if (result.success) {
                scripts.push({
                    customerId: custId,
                    script: result.scripts.primary
                });
            }
        }
        
        console.log('✅ 已获取', scripts.length, '个客户的话术');
        return scripts;
    }
};

/**
 * 场景4: 数据分析快速集成
 */
const DataAnalysisScenarios = {
    /**
     * 快速生成CLV预测
     * 用法: await DataAnalysisScenarios.quickCLVAnalysis([{id: 'c1'}, {id: 'c2'}]);
     */
    quickCLVAnalysis: async function(customers) {
        console.log('生成CLV预测:', customers.length, '个客户');
        
        window.aiIntegration.showAILoading();
        
        const result = await window.aiIntegration.predictCLV(customers);
        
        window.aiIntegration.hideAILoading();
        
        if (result.success) {
            console.log('CLV预测结果:');
            console.log('💰 平均CLV:', result.summary.averageCLV);
            console.log('📊 总预测价值:', result.summary.totalPredictedValue);
            console.log('⭐ 价值最高客户:', result.summary.topValueCustomers);
            return result;
        } else {
            console.error('❌ 预测失败:', result.error);
            return null;
        }
    },

    /**
     * 分析销售漏斗
     * 用法: await DataAnalysisScenarios.analyzeSalesFunnel({...funnelData});
     */
    analyzeSalesFunnel: async function(funnelData) {
        console.log('分析销售漏斗...');
        
        const result = await window.aiIntegration.analyzeFunnel(funnelData);
        
        if (result.success) {
            const analysis = result.analysis;
            console.log('漏斗分析:');
            console.log('📊 转化率:', analysis.conversionRates);
            console.log('⚠️  瓶颈:', analysis.bottlenecks);
            console.log('🎯 优化建议:', analysis.optimizations);
            console.log('📈 预期改进:', analysis.predictedImprovements);
            return analysis;
        } else {
            console.error('❌ 分析失败:', result.error);
            return null;
        }
    },

    /**
     * 快速客户细分
     * 用法: await DataAnalysisScenarios.segmentAllCustomers(customerList);
     */
    segmentAllCustomers: async function(customers) {
        console.log('分析客户细分:', customers.length, '个客户');
        
        window.aiIntegration.showAILoading();
        
        const result = await window.aiIntegration.segmentCustomers(customers);
        
        window.aiIntegration.hideAILoading();
        
        if (result.success) {
            console.log('客户细分结果:');
            console.log('📊 细分数量:', result.segmentCount);
            console.log('🏷️  细分结果:', result.segments);
            console.log('📈 细分特征:', result.characteristics);
            return result;
        } else {
            console.error('❌ 细分失败:', result.error);
            return null;
        }
    }
};

/**
 * 场景5: 营销自动化快速集成
 */
const MarketingAutomationScenarios = {
    /**
     * 创建客户旅程
     * 用法: await MarketingAutomationScenarios.createJourney({name: '新客引导', ...});
     */
    createJourney: async function(journeyConfig) {
        console.log('创建客户旅程:', journeyConfig.name);
        
        const result = await window.aiIntegration.createCustomerJourney(journeyConfig);
        
        if (result.success) {
            console.log('✅ 旅程已创建');
            console.log('旅程ID:', result.journeyId);
            return result;
        } else {
            console.error('❌ 创建失败:', result.error);
            return null;
        }
    },

    /**
     * 触发客户旅程
     * 用法: await MarketingAutomationScenarios.triggerJourney('cust_123', 'journey_456');
     */
    triggerJourney: async function(customerId, journeyId, event = {}) {
        console.log('触发旅程 - 客户:', customerId, '旅程:', journeyId);
        
        const result = await window.aiIntegration.triggerCustomerJourney(customerId, journeyId, event);
        
        if (result.success) {
            console.log('✅ 旅程已触发');
            console.log('触发时间:', result.triggeredAt);
            console.log('状态:', result.status);
            return result;
        } else {
            console.error('❌ 触发失败:', result.error);
            return null;
        }
    },

    /**
     * 发送智能邮件
     * 用法: await MarketingAutomationScenarios.sendSmartEmail(emailConfig, recipients);
     */
    sendSmartEmail: async function(emailConfig, recipients) {
        console.log('发送智能邮件 - 收件人数:', recipients.length);
        
        const result = await window.aiIntegration.sendSmartEmail(emailConfig, recipients);
        
        if (result.success) {
            console.log('✅ 邮件已发送');
            console.log('追踪ID:', result.trackingId);
            console.log('状态:', result.status);
            return result;
        } else {
            console.error('❌ 发送失败:', result.error);
            return null;
        }
    }
};

// ==================== 工具函数集合 ====================

/**
 * 快速工具函数
 */
const QuickTools = {
    /**
     * 获取用户信息
     */
    getUserInfo: function() {
        const userId = window.aiIntegration.getCurrentUserId();
        const sessionId = window.aiIntegration.generateSessionId();
        
        return {
            userId,
            sessionId,
            timestamp: new Date()
        };
    },

    /**
     * 重置会话
     */
    resetSession: function() {
        window.aiIntegration.clearSession();
        console.log('✅ 会话已重置');
    },

    /**
     * 显示加载状态
     */
    loading: function(message = 'Loading...') {
        window.aiIntegration.showAILoading();
    },

    /**
     * 隐藏加载状态
     */
    hideLoading: function() {
        window.aiIntegration.hideAILoading();
    },

    /**
     * 显示消息
     */
    message: function(text, type = 'info') {
        window.aiIntegration.showAIMessage(text, type);
    },

    /**
     * 成功消息
     */
    success: function(text) {
        window.aiIntegration.showAIMessage(text, 'success');
    },

    /**
     * 错误消息
     */
    error: function(text) {
        window.aiIntegration.showAIMessage(text, 'danger');
    },

    /**
     * 警告消息
     */
    warning: function(text) {
        window.aiIntegration.showAIMessage(text, 'warning');
    }
};

// ==================== 控制台日志辅助函数 ====================

/**
 * AI集成日志记录器
 */
const AILogger = {
    /**
     * 记录API调用
     */
    logAPICall: function(functionName, params) {
        console.group(`🔵 API调用: ${functionName}`);
        console.log('参数:', params);
        console.log('时间:', new Date().toLocaleTimeString());
        console.groupEnd();
    },

    /**
     * 记录成功
     */
    logSuccess: function(functionName, result) {
        console.group(`✅ 成功: ${functionName}`);
        console.log('结果:', result);
        console.log('时间:', new Date().toLocaleTimeString());
        console.groupEnd();
    },

    /**
     * 记录错误
     */
    logError: function(functionName, error) {
        console.group(`❌ 错误: ${functionName}`);
        console.error('错误:', error);
        console.log('时间:', new Date().toLocaleTimeString());
        console.groupEnd();
    },

    /**
     * 记录数据
     */
    logData: function(label, data) {
        console.group(`📊 数据: ${label}`);
        console.table(data);
        console.groupEnd();
    }
};

// ==================== 批处理工具 ====================

/**
 * 批处理工具
 */
const BatchTools = {
    /**
     * 批量分析客户
     * 用法: await BatchTools.analyzeCustomers(['c1', 'c2', 'c3']);
     */
    analyzeCustomers: async function(customerIds) {
        console.log('🔄 批量分析', customerIds.length, '个客户');
        
        const results = [];
        for (const custId of customerIds) {
            const result = await window.aiIntegration.analyzeCustomer(custId);
            results.push(result);
        }
        
        return results;
    },

    /**
     * 批量预测销售
     */
    predictSales: async function(leadIds) {
        console.log('🔄 批量预测', leadIds.length, '条线索');
        
        const result = await window.aiIntegration.batchPredictSales(leadIds);
        return result;
    },

    /**
     * 批量获取推荐
     */
    getRecommendations: async function(userIds, itemType = 'product') {
        console.log('🔄 批量获取推荐 -', userIds.length, '个用户');
        
        const results = [];
        for (const userId of userIds) {
            const result = await window.aiIntegration.getRecommendations(userId, itemType, 10);
            results.push(result);
        }
        
        return results;
    }
};

// ==================== 导出快速参考 ====================

window.aiQuickRef = {
    // 场景集合
    Chat: ChatScenarios,
    Analysis: AnalysisScenarios,
    Scripts: ScriptScenarios,
    DataAnalysis: DataAnalysisScenarios,
    Marketing: MarketingAutomationScenarios,
    
    // 工具函数
    Tools: QuickTools,
    Logger: AILogger,
    Batch: BatchTools
};

// ==================== 示例用法（控制台测试）====================

console.log(`
╔════════════════════════════════════════════╗
║  AI 集成快速参考已加载                      ║
╚════════════════════════════════════════════╝

快速开始示例:

1️⃣  聊天功能:
   await aiQuickRef.Chat.sendAndReply('请为我推荐销售话术')

2️⃣  客户分析:
   await aiQuickRef.Analysis.quickAnalyzeCustomer('cust_123')

3️⃣  话术推荐:
   await aiQuickRef.Scripts.getScriptByScenario('cust_123', 'opening')

4️⃣  销售预测:
   await aiQuickRef.Analysis.predictSalesSuccess('lead_456')

5️⃣  数据分析:
   await aiQuickRef.DataAnalysis.quickCLVAnalysis(customers)

6️⃣  快速工具:
   aiQuickRef.Tools.success('操作成功!')
   aiQuickRef.Logger.logData('客户数据', data)
   await aiQuickRef.Batch.analyzeCustomers(['c1', 'c2'])

更多示例请查看 aiQuickRef 对象的各个属性
`);

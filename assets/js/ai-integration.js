/**
 * ShopPro AI 集成脚本
 * 提供所有AI功能的API包装函数、数据处理、错误处理和UI助手
 * @version 1.0.0
 */

// ==================== AI 聊天功能 ====================

/**
 * 发送聊天消息
 * @param {string} message - 消息内容
 * @param {Object} options - 配置选项 {sessionId, userId, channel, context}
 * @returns {Promise<Object>} 响应数据
 */
async function sendChatMessage(message, options = {}) {
    try {
        const {
            sessionId = generateSessionId(),
            userId = getCurrentUserId(),
            channel = 'web',
            context = {}
        } = options;

        if (!message || typeof message !== 'string') {
            throw new Error('消息内容不能为空');
        }

        const response = await window.api.chat.sendMessage({
            userId: userId,
            sessionId: sessionId,
            message: message,
            channel: channel,
            context: context
        });

        return {
            success: true,
            botResponse: response?.bot_response || '抱歉，未获取到回复。',
            sessionId: sessionId,
            timestamp: new Date()
        };
    } catch (error) {
        console.error('发送聊天消息失败:', error);
        return {
            success: false,
            error: error.message || '发送消息失败，请稍后重试',
            timestamp: new Date()
        };
    }
}

/**
 * 获取聊天历史
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} 会话历史
 */
async function getChatHistory(sessionId) {
    try {
        if (!sessionId) {
            throw new Error('会话ID不能为空');
        }

        const response = await window.api.chat.getSession(sessionId);

        return {
            success: true,
            sessionId: sessionId,
            history: response?.messages || [],
            metadata: response?.metadata || {}
        };
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        return {
            success: false,
            error: error.message || '获取历史记录失败'
        };
    }
}

/**
 * 结束聊天会话
 * @param {string} sessionId - 会话ID
 * @returns {Promise<Object>} 结果
 */
async function endChatSession(sessionId) {
    try {
        if (!sessionId) {
            throw new Error('会话ID不能为空');
        }

        await window.api.chat.endSession(sessionId);

        return {
            success: true,
            message: '会话已结束'
        };
    } catch (error) {
        console.error('结束会话失败:', error);
        return {
            success: false,
            error: error.message || '结束会话失败'
        };
    }
}

/**
 * 知识库搜索
 * @param {string} query - 搜索查询
 * @param {number} limit - 返回结果数量
 * @returns {Promise<Object>} 搜索结果
 */
async function searchKnowledge(query, limit = 10) {
    try {
        if (!query || typeof query !== 'string') {
            throw new Error('搜索查询不能为空');
        }

        const response = await window.api.chat.knowledgeSearch(query, limit);

        return {
            success: true,
            query: query,
            results: response?.results || [],
            count: (response?.results || []).length
        };
    } catch (error) {
        console.error('知识库搜索失败:', error);
        return {
            success: false,
            error: error.message || '搜索失败',
            results: []
        };
    }
}

// ==================== AI 客户分析功能 ====================

/**
 * 分析客户信息
 * @param {string} customerId - 客户ID
 * @returns {Promise<Object>} 客户分析结果
 */
async function analyzeCustomer(customerId) {
    try {
        if (!customerId) {
            throw new Error('客户ID不能为空');
        }

        const response = await window.api.aiCustomer.analyze(customerId);

        return {
            success: true,
            customerId: customerId,
            analysis: {
                profile: response?.profile || {},
                behavior: response?.behavior || {},
                preferences: response?.preferences || {},
                score: response?.score || 0,
                tags: response?.tags || [],
                recommendations: response?.recommendations || []
            }
        };
    } catch (error) {
        console.error('客户分析失败:', error);
        return {
            success: false,
            error: error.message || '客户分析失败',
            customerId: customerId
        };
    }
}

/**
 * 获取客户分析缓存数据
 * @param {string} customerId - 客户ID
 * @returns {Promise<Object>} 分析数据
 */
async function getCustomerAnalysis(customerId) {
    try {
        if (!customerId) {
            throw new Error('客户ID不能为空');
        }

        const response = await window.api.aiCustomer.getAnalysis(customerId);

        return {
            success: true,
            data: response || {}
        };
    } catch (error) {
        console.error('获取客户分析失败:', error);
        return {
            success: false,
            error: error.message || '获取分析失败'
        };
    }
}

// ==================== AI 销售预测功能 ====================

/**
 * 预测销售线索成交概率
 * @param {string} leadId - 线索ID
 * @returns {Promise<Object>} 预测结果
 */
async function predictSales(leadId) {
    try {
        if (!leadId) {
            throw new Error('线索ID不能为空');
        }

        const response = await window.api.aiSales.predict(leadId);

        return {
            success: true,
            leadId: leadId,
            prediction: {
                conversionProbability: response?.conversion_probability || 0,
                closingTimeframe: response?.closing_timeframe || 'unknown',
                estimatedDealValue: response?.estimated_deal_value || 0,
                riskFactors: response?.risk_factors || [],
                opportunities: response?.opportunities || [],
                recommendedActions: response?.recommended_actions || []
            }
        };
    } catch (error) {
        console.error('销售预测失败:', error);
        return {
            success: false,
            error: error.message || '销售预测失败',
            leadId: leadId
        };
    }
}

/**
 * 批量预测销售
 * @param {Array<string>} leadIds - 线索ID数组
 * @returns {Promise<Object>} 批量预测结果
 */
async function batchPredictSales(leadIds) {
    try {
        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            throw new Error('线索ID数组不能为空');
        }

        const response = await window.api.aiSales.batchPredict(leadIds);

        return {
            success: true,
            totalLeads: leadIds.length,
            predictions: response?.predictions || [],
            summary: response?.summary || {}
        };
    } catch (error) {
        console.error('批量销售预测失败:', error);
        return {
            success: false,
            error: error.message || '批量预测失败',
            failedLeads: leadIds
        };
    }
}

// ==================== AI 话术推荐功能 ====================

/**
 * 推荐销售话术
 * @param {string} customerId - 客户ID
 * @param {string} scenario - 场景类型 (general|objection|closing|opening)
 * @returns {Promise<Object>} 推荐话术
 */
async function recommendScript(customerId, scenario = 'general') {
    try {
        if (!customerId) {
            throw new Error('客户ID不能为空');
        }

        const validScenarios = ['general', 'objection', 'closing', 'opening', 'discovery'];
        const normalizedScenario = validScenarios.includes(scenario) ? scenario : 'general';

        const response = await window.api.aiScript.recommend(customerId, normalizedScenario);

        return {
            success: true,
            customerId: customerId,
            scenario: normalizedScenario,
            scripts: {
                primary: response?.primary_script || '',
                alternatives: response?.alternative_scripts || [],
                successRate: response?.success_rate || 0,
                usageCount: response?.usage_count || 0,
                tags: response?.tags || [],
                tips: response?.tips || []
            }
        };
    } catch (error) {
        console.error('话术推荐失败:', error);
        return {
            success: false,
            error: error.message || '话术推荐失败',
            scenario: scenario
        };
    }
}

// ==================== AI 风险分析功能 ====================

/**
 * 分析客户流失风险
 * @param {Array<string>} customerIds - 客户ID数组
 * @returns {Promise<Object>} 风险分析结果
 */
async function analyzeChurnRisk(customerIds) {
    try {
        if (!Array.isArray(customerIds) || customerIds.length === 0) {
            throw new Error('客户ID数组不能为空');
        }

        const response = await window.api.aiRisk.analyze(customerIds);

        return {
            success: true,
            totalCustomers: customerIds.length,
            analysis: {
                highRiskCustomers: response?.high_risk_customers || [],
                mediumRiskCustomers: response?.medium_risk_customers || [],
                lowRiskCustomers: response?.low_risk_customers || [],
                churnProbabilities: response?.churn_probabilities || {},
                retentionStrategies: response?.retention_strategies || []
            }
        };
    } catch (error) {
        console.error('风险分析失败:', error);
        return {
            success: false,
            error: error.message || '风险分析失败',
            customerIds: customerIds
        };
    }
}

// ==================== 高级 AI 分析功能 ====================

/**
 * 预测客户生命周期价值 (CLV)
 * @param {Array<Object>} customers - 客户数据数组
 * @returns {Promise<Object>} CLV预测结果
 */
async function predictCLV(customers) {
    try {
        if (!Array.isArray(customers) || customers.length === 0) {
            throw new Error('客户数据不能为空');
        }

        const response = await window.api.aiAdvanced.predictCLV(customers);

        return {
            success: true,
            totalCustomers: customers.length,
            predictions: response?.predictions || [],
            summary: {
                averageCLV: response?.average_clv || 0,
                totalPredictedValue: response?.total_predicted_value || 0,
                topValueCustomers: response?.top_value_customers || []
            }
        };
    } catch (error) {
        console.error('CLV预测失败:', error);
        return {
            success: false,
            error: error.message || 'CLV预测失败'
        };
    }
}

/**
 * 分析销售漏斗
 * @param {Object} funnelData - 漏斗数据
 * @returns {Promise<Object>} 漏斗分析结果
 */
async function analyzeFunnel(funnelData) {
    try {
        if (!funnelData || typeof funnelData !== 'object') {
            throw new Error('漏斗数据不能为空');
        }

        const response = await window.api.aiAdvanced.analyzeFunnel(funnelData);

        return {
            success: true,
            analysis: {
                conversionRates: response?.conversion_rates || {},
                bottlenecks: response?.bottlenecks || [],
                optimizations: response?.optimizations || [],
                predictedImprovements: response?.predicted_improvements || {}
            }
        };
    } catch (error) {
        console.error('漏斗分析失败:', error);
        return {
            success: false,
            error: error.message || '漏斗分析失败'
        };
    }
}

/**
 * 客户细分
 * @param {Array<Object>} customers - 客户数据数组
 * @returns {Promise<Object>} 细分结果
 */
async function segmentCustomers(customers) {
    try {
        if (!Array.isArray(customers) || customers.length === 0) {
            throw new Error('客户数据不能为空');
        }

        const response = await window.api.aiAdvanced.segmentCustomers(customers);

        return {
            success: true,
            segments: response?.segments || [],
            segmentCount: (response?.segments || []).length,
            characteristics: response?.characteristics || {}
        };
    } catch (error) {
        console.error('客户细分失败:', error);
        return {
            success: false,
            error: error.message || '客户细分失败'
        };
    }
}

/**
 * 获取个性化推荐
 * @param {string} userId - 用户ID
 * @param {string} itemType - 商品类型 (product|content|service)
 * @param {number} count - 推荐数量
 * @param {Array} interactions - 用户交互记录
 * @returns {Promise<Object>} 推荐结果
 */
async function getRecommendations(userId, itemType = 'product', count = 10, interactions = []) {
    try {
        if (!userId) {
            throw new Error('用户ID不能为空');
        }

        const response = await window.api.aiAdvanced.getRecommendations(userId, itemType, count, interactions);

        return {
            success: true,
            userId: userId,
            itemType: itemType,
            recommendations: response?.recommendations || [],
            score: response?.recommendation_score || 0,
            reasoning: response?.reasoning || []
        };
    } catch (error) {
        console.error('获取推荐失败:', error);
        return {
            success: false,
            error: error.message || '获取推荐失败'
        };
    }
}

// ==================== 营销自动化功能 ====================

/**
 * 创建客户旅程
 * @param {Object} journeyConfig - 旅程配置
 * @returns {Promise<Object>} 创建结果
 */
async function createCustomerJourney(journeyConfig) {
    try {
        if (!journeyConfig || typeof journeyConfig !== 'object') {
            throw new Error('旅程配置不能为空');
        }

        const response = await window.api.aiMarketing.createJourney(journeyConfig);

        return {
            success: true,
            journeyId: response?.journey_id || '',
            config: journeyConfig,
            createdAt: new Date()
        };
    } catch (error) {
        console.error('创建旅程失败:', error);
        return {
            success: false,
            error: error.message || '创建旅程失败'
        };
    }
}

/**
 * 触发客户旅程
 * @param {string} customerId - 客户ID
 * @param {string} journeyId - 旅程ID
 * @param {Object} triggerEvent - 触发事件
 * @returns {Promise<Object>} 触发结果
 */
async function triggerCustomerJourney(customerId, journeyId, triggerEvent = {}) {
    try {
        if (!customerId || !journeyId) {
            throw new Error('客户ID和旅程ID不能为空');
        }

        const response = await window.api.aiMarketing.triggerJourney(customerId, journeyId, triggerEvent);

        return {
            success: true,
            customerId: customerId,
            journeyId: journeyId,
            triggeredAt: new Date(),
            status: response?.status || 'started'
        };
    } catch (error) {
        console.error('触发旅程失败:', error);
        return {
            success: false,
            error: error.message || '触发旅程失败'
        };
    }
}

/**
 * 发送智能邮件
 * @param {Object} emailConfig - 邮件配置
 * @param {Array} recipients - 收件人列表
 * @returns {Promise<Object>} 发送结果
 */
async function sendSmartEmail(emailConfig, recipients) {
    try {
        if (!emailConfig || !Array.isArray(recipients) || recipients.length === 0) {
            throw new Error('邮件配置和收件人不能为空');
        }

        const response = await window.api.aiMarketing.sendSmartEmail(emailConfig, recipients);

        return {
            success: true,
            recipientCount: recipients.length,
            sentAt: new Date(),
            trackingId: response?.tracking_id || '',
            status: response?.status || 'sent'
        };
    } catch (error) {
        console.error('发送邮件失败:', error);
        return {
            success: false,
            error: error.message || '发送邮件失败',
            recipientCount: recipients.length
        };
    }
}

/**
 * 优化邮件发送时间
 * @param {Array} recipients - 收件人列表
 * @returns {Promise<Object>} 优化建议
 */
async function optimizeSendTiming(recipients) {
    try {
        if (!Array.isArray(recipients) || recipients.length === 0) {
            throw new Error('收件人列表不能为空');
        }

        const response = await window.api.aiMarketing.optimizeSendTiming(recipients);

        return {
            success: true,
            recommendations: response?.recommendations || {},
            bestTimes: response?.best_times || [],
            expectedOpenRate: response?.expected_open_rate || 0
        };
    } catch (error) {
        console.error('优化时间失败:', error);
        return {
            success: false,
            error: error.message || '优化失败'
        };
    }
}

// ==================== AI 分析和报表功能 ====================

/**
 * 创建数据透视分析
 * @param {Array} data - 数据
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 分析结果
 */
async function createPivotAnalysis(data, config) {
    try {
        if (!data || !config) {
            throw new Error('数据和配置不能为空');
        }

        const response = await window.api.aiAnalytics.createPivotAnalysis(data, config);

        return {
            success: true,
            analysis: response?.analysis || {},
            insights: response?.insights || [],
            visualizations: response?.visualizations || []
        };
    } catch (error) {
        console.error('创建透视分析失败:', error);
        return {
            success: false,
            error: error.message || '分析失败'
        };
    }
}

/**
 * 生成自定义报表
 * @param {Object} config - 报表配置
 * @param {Array} data - 数据
 * @returns {Promise<Object>} 报表数据
 */
async function generateCustomReport(config, data) {
    try {
        if (!config || !data) {
            throw new Error('配置和数据不能为空');
        }

        const response = await window.api.aiAnalytics.generateCustomReport(config, data);

        return {
            success: true,
            reportId: response?.report_id || '',
            report: response?.report || {},
            generatedAt: new Date()
        };
    } catch (error) {
        console.error('生成报表失败:', error);
        return {
            success: false,
            error: error.message || '生成报表失败'
        };
    }
}

/**
 * 检测数据异常
 * @param {Array} data - 数据
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 异常检测结果
 */
async function detectAnomalies(data, config) {
    try {
        if (!data || !config) {
            throw new Error('数据和配置不能为空');
        }

        const response = await window.api.aiAnalytics.detectAnomalies(data, config);

        return {
            success: true,
            anomalies: response?.anomalies || [],
            severity: response?.severity || 'low',
            recommendations: response?.recommendations || []
        };
    } catch (error) {
        console.error('异常检测失败:', error);
        return {
            success: false,
            error: error.message || '异常检测失败'
        };
    }
}

/**
 * 预测趋势
 * @param {Array} data - 历史数据
 * @param {Object} config - 配置
 * @returns {Promise<Object>} 趋势预测结果
 */
async function predictTrends(data, config) {
    try {
        if (!data || !config) {
            throw new Error('数据和配置不能为空');
        }

        const response = await window.api.aiAnalytics.predictTrends(data, config);

        return {
            success: true,
            forecast: response?.forecast || [],
            confidence: response?.confidence || 0,
            trend: response?.trend || 'stable',
            insights: response?.insights || []
        };
    } catch (error) {
        console.error('趋势预测失败:', error);
        return {
            success: false,
            error: error.message || '趋势预测失败'
        };
    }
}

// ==================== 工具函数 ====================

/**
 * 生成会话ID
 * @returns {string} 会话ID
 */
function generateSessionId() {
    let sid = localStorage.getItem('shoppro_chat_session_id');
    if (!sid) {
        sid = `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        localStorage.setItem('shoppro_chat_session_id', sid);
    }
    return sid;
}

/**
 * 获取当前用户ID
 * @returns {string} 用户ID
 */
function getCurrentUserId() {
    return localStorage.getItem('user_id') || localStorage.getItem('customer_id') || 'guest';
}

/**
 * 清除会话
 */
function clearSession() {
    localStorage.removeItem('shoppro_chat_session_id');
}

/**
 * 检查AI服务健康状态
 * @returns {Promise<Boolean>} 是否正常
 */
async function checkAIServiceHealth() {
    try {
        const response = await window.api.aiHealth();
        return response?.status === 'ok' || response?.status === 'healthy';
    } catch (error) {
        console.error('AI服务检查失败:', error);
        return false;
    }
}

/**
 * 格式化AI响应时间戳
 * @param {Date|string} timestamp - 时间戳
 * @returns {string} 格式化时间
 */
function formatAITimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * 显示AI加载动画
 */
function showAILoading() {
    if (window.UI && window.UI.showLoading) {
        UI.showLoading('AI正在思考中...');
    }
}

/**
 * 隐藏AI加载动画
 */
function hideAILoading() {
    if (window.UI && window.UI.hideLoading) {
        UI.hideLoading();
    }
}

/**
 * 显示AI提示消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 (success|warning|danger|info)
 */
function showAIMessage(message, type = 'info') {
    if (window.UI && window.UI.showMessage) {
        UI.showMessage(message, type);
    }
}

// ==================== 导出所有函数 ====================

window.aiIntegration = {
    // 聊天功能
    sendChatMessage,
    getChatHistory,
    endChatSession,
    searchKnowledge,
    
    // 客户分析
    analyzeCustomer,
    getCustomerAnalysis,
    
    // 销售预测
    predictSales,
    batchPredictSales,
    
    // 话术推荐
    recommendScript,
    
    // 风险分析
    analyzeChurnRisk,
    
    // 高级功能
    predictCLV,
    analyzeFunnel,
    segmentCustomers,
    getRecommendations,
    
    // 营销自动化
    createCustomerJourney,
    triggerCustomerJourney,
    sendSmartEmail,
    optimizeSendTiming,
    
    // 分析报表
    createPivotAnalysis,
    generateCustomReport,
    detectAnomalies,
    predictTrends,
    
    // 工具函数
    generateSessionId,
    getCurrentUserId,
    clearSession,
    checkAIServiceHealth,
    formatAITimestamp,
    showAILoading,
    hideAILoading,
    showAIMessage
};

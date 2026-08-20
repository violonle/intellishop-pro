package com.shoppro.service;

import com.shoppro.dto.response.LeadAnalysisResponse;
import com.shoppro.dto.response.ChurnAnalysisResponse;
import com.shoppro.dto.response.CustomerProfileResponse;
import com.shoppro.dto.response.ScriptGenerationResponse;
import com.shoppro.dto.response.SalesPredictionResponse;
import java.util.Map;

/**
 * AI 服务接口
 * 提供大模型驱动的预测、分析和建议功能
 */
public interface AiService {

    /**
     * 生成销售预测和建议
     * 
     * @param historicalData 历史销售数据
     * @return AI 生成的预测和建议
     */
    String generateSalesAdvice(Map<String, Object> historicalData);

    /**
     * 分析线索质量
     * 
     * @param leadInfo 线索信息
     * @return 线索评分和分析建议
     */
    String analyzeLeadQuality(Map<String, Object> leadInfo);

    /**
     * 结构化分析线索质量
     *
     * @param leadInfo 线索信息
     * @return 结构化的分析响应
     */
    LeadAnalysisResponse analyzeLeadQualityStructured(Map<String, Object> leadInfo);

    /**
     * 预测客户流失风险
     * 
     * @param customerBehavior 客户行为数据
     * @return 流失压力评分和挽留建议
     */
    String predictCustomerChurn(Map<String, Object> customerBehavior);

    /**
     * 结构化预测客户流失风险
     *
     * @param customerBehavior 客户行为数据
     * @return 结构化的流失分析响应
     */
    ChurnAnalysisResponse predictCustomerChurnStructured(Map<String, Object> customerBehavior);

    /**
     * 客户画像分析
     *
     * @param customerData 客户基础信息及行为数据
     * @return 客户画像分析结果
     */
    CustomerProfileResponse analyzeCustomerProfile(Map<String, Object> customerData);

    /**
     * 营销话术生成
     *
     * @param context 话术生成背景上下文（如产品信息、客户痛点、场景等）
     * @return 生成的话术及建议
     */
    ScriptGenerationResponse generateMarketingScript(Map<String, Object> context);

    /**
     * 结构化销售预测
     *
     * @param historicalData 历史销售数据及市场信息
     * @return 结构化的销售预测报告
     */
    SalesPredictionResponse predictSalesStructured(Map<String, Object> historicalData);

    /**
     * 生成销售团队分析洞察
     *
     * @param salesData 销售团队业绩数据
     * @return AI 生成的团队管理建议
     */
    String generateSalesTeamInsight(java.util.List<Map<String, Object>> salesData);

    /**
     * 获取 AI 评分后的线索列表
     *
     * @return 包含评分和建议的线索列表
     */
    java.util.List<Map<String, Object>> getAiScoredLeads();

    /**
     * 生成高级分析页面的 AI 智能洞察
     *
     * @param analyticsData 分析数据汇总
     * @return AI 生成的业务洞察建议
     */
    String generateSalesAnalyticsInsight(Map<String, Object> analyticsData);

    /**
     * 通用 AI 对话接口
     *
     * @param message 用户消息
     * @param context 上下文信息（可选）
     * @return AI 回复内容
     */
    String chat(String message, Map<String, Object> context);
}

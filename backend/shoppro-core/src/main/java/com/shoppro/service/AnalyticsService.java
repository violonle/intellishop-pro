package com.shoppro.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 数据分析服务接口
 * 提供仪表板统计、多维度分析、报表生成、趋势预测等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
public interface AnalyticsService {

    // ========== 仪表板统计 ==========

    /**
     * 获取销售仪表板数据
     * 返回关键销售指标：总销售额、订单数、平均客单价等
     */
    Map<String, Object> getSalesDashboard();

    /**
     * 获取客户仪表板数据
     * 返回客户相关指标：新增客户、活跃客户、客户流失率等
     */
    Map<String, Object> getCustomerDashboard();

    /**
     * 获取业绩仪表板数据
     * 返回销售人员业绩指标
     */
    Map<String, Object> getPerformanceDashboard();

    /**
     * 获取产品仪表板数据
     * 返回产品相关指标：热销产品、库存预警等
     */
    Map<String, Object> getProductDashboard();

    // ========== 销售分析 ==========

    /**
     * 获取销售趋势分析
     * 
     * @param startDate   开始日期
     * @param endDate     结束日期
     * @param granularity 粒度：day/week/month/quarter/year
     */
    Map<String, Object> getSalesTrend(LocalDate startDate, LocalDate endDate, String granularity);

    /**
     * 获取销售排名统计
     * 按销售额、订单数、客单价等维度
     */
    Map<String, Object> getSalesRanking(String dimension, int limit);

    /**
     * 获取销售渠道分析
     * 按线上线下、各渠道的销售数据
     */
    Map<String, Object> getSalesChannelAnalysis();

    /**
     * 获取销售人员业绩排名
     */
    List<Map<String, Object>> getSalesPersonRanking(int limit);

    /**
     * 获取销售漏斗分析
     * 展示从线索到成交的转化过程
     */
    Map<String, Object> getSalesFunnelAnalysis();

    /**
     * 获取线索来源统计
     * 按来源分类统计线索数量和转化率
     */
    Map<String, Object> getLeadSourceStatistics();

    /**
     * 获取线索预估价值统计
     * 统计各阶段线索的预估总价值
     */
    Map<String, Object> getLeadEstimatedValueStatistics();

    /**
     * 获取跟进平均时长统计
     * 统计跟进记录的平均时长
     */
    Map<String, Object> getFollowUpDurationStatistics();

    // ========== 客户分析 ==========

    /**
     * 获取客户生命周期分析
     * 新客户、活跃客户、沉睡客户、流失客户的分布
     */
    Map<String, Object> getCustomerLifecycleAnalysis();

    /**
     * 获取客户价值分析
     * 按客户等级、消费金额等维度
     */
    Map<String, Object> getCustomerValueAnalysis();

    /**
     * 获取客户行为分析
     * 客户购买行为、跟进行为等
     */
    Map<String, Object> getCustomerBehaviorAnalysis();

    /**
     * 获取客户流失分析
     * 流失客户的原因、流失风险预测等
     */
    Map<String, Object> getCustomerChurnAnalysis();

    /**
     * 获取客户分布分析
     * 地域分布、行业分布等
     */
    Map<String, Object> getCustomerDistributionAnalysis();

    // ========== 产品分析 ==========

    /**
     * 获取产品热销分析
     * 销售排名、销售趋势等
     */
    Map<String, Object> getProductPopularityAnalysis();

    /**
     * 获取产品库存分析
     * 库存预警、库存周转率等
     */
    Map<String, Object> getProductInventoryAnalysis();

    /**
     * 获取产品毛利分析
     * 按产品、分类、时间维度的毛利分析
     */
    Map<String, Object> getProductProfitAnalysis();

    /**
     * 获取产品分类销售分析
     * 各分类的销售情况对比
     */
    Map<String, Object> getProductCategorySalesAnalysis();

    // ========== 趋势预测 ==========

    /**
     * 预测销售趋势
     * 基于历史数据预测未来销售
     * 
     * @param days 预测天数
     */
    Map<String, Object> predictSalesTrend(int days);

    /**
     * 预测客户流失
     * 识别可能流失的客户
     */
    List<Map<String, Object>> predictCustomerChurn();

    /**
     * 预测库存需求
     * 基于销售趋势预测库存需求
     */
    Map<String, Object> predictInventoryDemand();

    /**
     * 预测成交概率
     * 对指定时间段的成交情况进行预测
     */
    Map<String, Object> predictConversionRate();

    // ========== 对比分析 ==========

    /**
     * 获取年度对比分析
     * 当年与往年的对比
     */
    Map<String, Object> getYearOverYearComparison();

    /**
     * 获取月度对比分析
     * 当月与上月的对比
     */
    Map<String, Object> getMonthOverMonthComparison();

    /**
     * 获取销售人员对比分析
     * 销售人员之间的业绩对比
     */
    Map<String, Object> getSalesPersonComparison();

    /**
     * 获取产品对比分析
     * 产品之间的销售对比
     */
    Map<String, Object> getProductComparison();

    // ========== 报表生成 ==========

    /**
     * 生成销售报表
     * 
     * @param startDate 开始日期
     * @param endDate   结束日期
     */
    byte[] generateSalesReport(LocalDate startDate, LocalDate endDate);

    /**
     * 生成客户报表
     */
    byte[] generateCustomerReport();

    /**
     * 生成产品报表
     */
    byte[] generateProductReport();

    /**
     * 生成综合报表
     * 
     * @param startDate 开始日期
     * @param endDate   结束日期
     */
    byte[] generateComprehensiveReport(LocalDate startDate, LocalDate endDate);

    /**
     * 生成业绩报表
     * 
     * @param userId 可选，指定销售人员ID
     */
    byte[] generatePerformanceReport(Long userId);

    // ========== 数据聚合 ==========

    /**
     * 获取综合数据分析
     * 整合多个维度的数据分析
     */
    Map<String, Object> getComprehensiveAnalysis();

    /**
     * 获取关键业务指标（KPI）
     */
    Map<String, Object> getKeyPerformanceIndicators();

    /**
     * 获取异常预警数据
     * 库存不足、客户流失风险等预警
     */
    List<Map<String, Object>> getAnomalyAlerts();

    /**
     * 获取销售行为分析
     * 基于跟进记录进行的深度分析（通话时长、关键词提取、情绪分析等）
     */
    Map<String, Object> getSalesBehaviorAnalysis(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取高级分析数据（用于高级分析页面）
     * 整合趋势、细分、漏斗及关键KPI数据
     */
    Map<String, Object> getAdvancedAnalyticsData(String timeRange);
}

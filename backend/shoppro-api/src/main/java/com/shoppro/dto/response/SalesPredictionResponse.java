package com.shoppro.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.math.BigDecimal;

/**
 * AI 销售预测响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPredictionResponse {
    /**
     * 预测销售额
     */
    private BigDecimal predictedRevenue;

    /**
     * 环比增长率 (如：0.15 表示 15%)
     */
    private Double growthRate;

    /**
     * 市场趋势分析
     */
    private String marketTrend;

    /**
     * 关键影响因素
     */
    private List<String> keyFactors;

    /**
     * 建议采取的行动
     */
    private List<String> recommendedActions;

    /**
     * 信心指数 (0.0-1.0)
     */
    private Double confidenceScore;
}

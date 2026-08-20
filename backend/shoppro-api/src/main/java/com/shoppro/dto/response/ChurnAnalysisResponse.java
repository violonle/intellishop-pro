package com.shoppro.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * 客户流失风险 AI 分析结果响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChurnAnalysisResponse {

    /**
     * 流失风险等级 (High/Medium/Low)
     */
    private String riskLevel;

    /**
     * 流失概率 (0.0-1.0)
     */
    private Double churnProbability;

    /**
     * 主要流失原因列表
     */
    private List<String> primaryReasons;

    /**
     * 挽留策略建议
     */
    private String retentionStrategy;

    /**
     * 建议行动列表
     */
    private List<String> actionItems;
}

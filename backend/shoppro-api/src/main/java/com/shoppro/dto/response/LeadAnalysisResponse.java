package com.shoppro.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * 销售线索 AI 分析结果响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadAnalysisResponse {

    /**
     * 线索得分 (1-100)
     */
    private Integer score;

    /**
     * 意向等级 (High/Medium/Low)
     */
    private String intentLevel;

    /**
     * 核心分析
     */
    private String analysis;

    /**
     * 建议行动列表
     */
    private List<String> suggestions;

    /**
     * 预测成功率 (0.0-1.0)
     */
    private Double successProbability;
}

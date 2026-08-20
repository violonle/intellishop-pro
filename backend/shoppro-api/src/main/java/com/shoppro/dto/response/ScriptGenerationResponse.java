package com.shoppro.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * AI 话术生成响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScriptGenerationResponse {
    /**
     * 场景标题
     */
    private String scene;

    /**
     * 推荐话术列表
     */
    private List<String> scripts;

    /**
     * 话术技巧/注意事项
     */
    private String tips;

    /**
     * 适用阶段 (如：开场、需求挖掘、异议处理、成交)
     */
    private String applicableStage;
}

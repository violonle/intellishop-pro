package com.shoppro.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

/**
 * 客户画像 AI 分析响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponse {
    /**
     * 客户标签 (如：价格敏感型、品质追求者、活跃用户等)
     */
    private List<String> tags;

    /**
     * 客户性格/行为风格分析
     */
    private String persona;

    /**
     * 潜在需求
     */
    private List<String> potentialNeeds;

    /**
     * 购买偏好分析
     */
    private String purchasePreferences;

    /**
     * 建议维护策略
     */
    private String maintenanceStrategy;
}

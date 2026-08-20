package com.shoppro.service;

import com.shoppro.entity.AiRevenueConfig;

import java.util.List;
import java.util.Map;

public interface RevenueIntelligenceService {
    Map<String, Object> getRevenueDashboard();
    Map<String, Object> getPipelineHealth();
    Map<String, Object> getWinRateTrends();
    List<Map<String, Object>> getAtRiskDeals();
    Map<String, Object> inspectDeal(Long dealId);
    List<AiRevenueConfig> getAllRevenueConfigs();
    AiRevenueConfig updateRevenueConfig(Long id, AiRevenueConfig config);
}

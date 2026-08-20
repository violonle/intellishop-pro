package com.shoppro.service;

import com.shoppro.entity.AiCoachingRule;
import com.shoppro.entity.AiConversation;

import java.util.List;
import java.util.Map;

public interface ConversationIntelligenceService {
    List<AiConversation> getConversations(Long customerId, Long salesId, String sentiment, int pageNo, int pageSize);
    AiConversation getConversationById(Long id);
    AiConversation createAndAnalyzeConversation(AiConversation conversation);
    Map<String, Object> getLiveCoachingAdvice(Long customerId, String currentKeywords);
    List<AiCoachingRule> getAllCoachingRules();
    AiCoachingRule createOrUpdateCoachingRule(AiCoachingRule rule);
    boolean deleteCoachingRule(Long id);
}

package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.AiCoachingRule;
import com.shoppro.entity.AiConversation;
import com.shoppro.repository.AiCoachingRuleRepository;
import com.shoppro.repository.AiConversationRepository;
import com.shoppro.service.ConversationIntelligenceService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConversationIntelligenceServiceImpl implements ConversationIntelligenceService {

    private final AiConversationRepository conversationRepo;
    private final AiCoachingRuleRepository coachingRuleRepo;

    public ConversationIntelligenceServiceImpl(AiConversationRepository conversationRepo, AiCoachingRuleRepository coachingRuleRepo) {
        this.conversationRepo = conversationRepo;
        this.coachingRuleRepo = coachingRuleRepo;
    }

    @Override
    public List<AiConversation> getConversations(Long customerId, Long salesId, String sentiment, int pageNo, int pageSize) {
        QueryWrapper<AiConversation> qw = new QueryWrapper<>();
        if (customerId != null) qw.eq("customer_id", customerId);
        if (salesId != null) qw.eq("sales_id", salesId);
        if (sentiment != null && !sentiment.isEmpty() && !"all".equalsIgnoreCase(sentiment)) {
            qw.eq("sentiment", sentiment);
        }
        qw.orderByDesc("created_at");
        Page<AiConversation> page = new Page<>(pageNo, pageSize);
        return conversationRepo.selectPage(page, qw).getRecords();
    }

    @Override
    public AiConversation getConversationById(Long id) {
        return conversationRepo.selectById(id);
    }

    @Override
    public AiConversation createAndAnalyzeConversation(AiConversation conversation) {
        if (conversation.getCreatedAt() == null) conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepo.insert(conversation);
        return conversation;
    }

    @Override
    public Map<String, Object> getLiveCoachingAdvice(Long customerId, String currentKeywords) {
        Map<String, Object> advice = new HashMap<>();
        List<AiCoachingRule> rules = coachingRuleRepo.selectList(new QueryWrapper<AiCoachingRule>().eq("is_enabled", 1).orderByAsc("sort_order"));
        
        AiCoachingRule matchedRule = null;
        if (currentKeywords != null && !currentKeywords.isEmpty()) {
            for (AiCoachingRule rule : rules) {
                if (currentKeywords.contains(rule.getKeyword()) || rule.getKeyword().contains(currentKeywords)) {
                    matchedRule = rule;
                    break;
                }
            }
        }
        if (matchedRule == null && !rules.isEmpty()) {
            matchedRule = rules.get(0); // 默认返回第一条建议
        }

        advice.put("customerId", customerId);
        advice.put("suggestedResponse", matchedRule != null ? matchedRule.getSuggestedResponse() : null);
        advice.put("scenario", matchedRule != null ? matchedRule.getScenario() : null);
        advice.put("actionType", matchedRule != null ? matchedRule.getActionType() : null);
        advice.put("rules", rules);
        return advice;
    }

    @Override
    public List<AiCoachingRule> getAllCoachingRules() {
        return coachingRuleRepo.selectList(new QueryWrapper<AiCoachingRule>().orderByAsc("sort_order"));
    }

    @Override
    public AiCoachingRule createOrUpdateCoachingRule(AiCoachingRule rule) {
        if (rule.getId() == null) {
            rule.setCreatedAt(LocalDateTime.now());
            rule.setUpdatedAt(LocalDateTime.now());
            coachingRuleRepo.insert(rule);
        } else {
            rule.setUpdatedAt(LocalDateTime.now());
            coachingRuleRepo.updateById(rule);
        }
        return rule;
    }

    @Override
    public boolean deleteCoachingRule(Long id) {
        return coachingRuleRepo.deleteById(id) > 0;
    }
}

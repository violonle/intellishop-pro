package com.shoppro.service;

import com.shoppro.entity.AiSignal;
import com.shoppro.entity.AiSignalType;
import com.shoppro.entity.AiTriggerRule;

import java.util.List;
import java.util.Map;

public interface SignalService {
    List<AiSignal> getSignals(Long salesId, String signalType, Integer isHandled, int pageNo, int pageSize);
    AiSignal getSignalById(Long id);
    boolean handleSignal(Long id);
    Map<String, Object> getSignalStats();
    List<AiSignal> getSignalsByTarget(String targetType, Long targetId);
    
    // Signal Types & Triggers
    List<AiSignalType> getAllSignalTypes();
    AiSignalType createOrUpdateSignalType(AiSignalType type);
    boolean deleteSignalType(Long id);

    List<AiTriggerRule> getAllTriggerRules();
    AiTriggerRule createOrUpdateTriggerRule(AiTriggerRule rule);
    boolean deleteTriggerRule(Long id);
}

package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.AiSignal;
import com.shoppro.entity.AiSignalType;
import com.shoppro.entity.AiTriggerRule;
import com.shoppro.repository.AiSignalRepository;
import com.shoppro.repository.AiSignalTypeRepository;
import com.shoppro.repository.AiTriggerRuleRepository;
import com.shoppro.service.SignalService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SignalServiceImpl implements SignalService {

    private final AiSignalRepository signalRepo;
    private final AiSignalTypeRepository signalTypeRepo;
    private final AiTriggerRuleRepository triggerRuleRepo;

    public SignalServiceImpl(AiSignalRepository signalRepo, AiSignalTypeRepository signalTypeRepo, AiTriggerRuleRepository triggerRuleRepo) {
        this.signalRepo = signalRepo;
        this.signalTypeRepo = signalTypeRepo;
        this.triggerRuleRepo = triggerRuleRepo;
    }

    @Override
    public List<AiSignal> getSignals(Long salesId, String signalType, Integer isHandled, int pageNo, int pageSize) {
        QueryWrapper<AiSignal> qw = new QueryWrapper<>();
        if (salesId != null) qw.eq("sales_id", salesId);
        if (signalType != null && !signalType.isEmpty() && !"all".equalsIgnoreCase(signalType)) {
            qw.eq("signal_type", signalType);
        }
        if (isHandled != null) {
            qw.eq("is_handled", isHandled);
        }
        qw.orderByDesc("created_at");
        Page<AiSignal> page = new Page<>(pageNo, pageSize);
        return signalRepo.selectPage(page, qw).getRecords();
    }

    @Override
    public AiSignal getSignalById(Long id) {
        return signalRepo.selectById(id);
    }

    @Override
    public boolean handleSignal(Long id) {
        AiSignal signal = signalRepo.selectById(id);
        if (signal != null) {
            signal.setIsHandled(1);
            signal.setHandledAt(LocalDateTime.now());
            return signalRepo.updateById(signal) > 0;
        }
        return false;
    }

    @Override
    public Map<String, Object> getSignalStats() {
        Map<String, Object> stats = new HashMap<>();
        QueryWrapper<AiSignal> totalQw = new QueryWrapper<>();
        Long total = signalRepo.selectCount(totalQw);

        QueryWrapper<AiSignal> unhandledQw = new QueryWrapper<>();
        unhandledQw.eq("is_handled", 0);
        Long unhandled = signalRepo.selectCount(unhandledQw);

        QueryWrapper<AiSignal> highPriorityQw = new QueryWrapper<>();
        highPriorityQw.eq("priority", "high").eq("is_handled", 0);
        Long highPriority = signalRepo.selectCount(highPriorityQw);

        stats.put("totalSignals", total != null ? total : 0);
        stats.put("unhandledSignals", unhandled != null ? unhandled : 0);
        stats.put("highPriorityUnhandled", highPriority != null ? highPriority : 0);
        stats.put("handledRate", total != null && total > 0 ? (double)(total - unhandled) / total : 1.0);
        return stats;
    }

    @Override
    public List<AiSignal> getSignalsByTarget(String targetType, Long targetId) {
        QueryWrapper<AiSignal> qw = new QueryWrapper<>();
        qw.eq("target_type", targetType).eq("target_id", targetId).orderByDesc("created_at");
        return signalRepo.selectList(qw);
    }

    @Override
    public List<AiSignalType> getAllSignalTypes() {
        return signalTypeRepo.selectList(null);
    }

    @Override
    public AiSignalType createOrUpdateSignalType(AiSignalType type) {
        if (type.getId() == null) {
            type.setCreatedAt(LocalDateTime.now());
            signalTypeRepo.insert(type);
        } else {
            signalTypeRepo.updateById(type);
        }
        return type;
    }

    @Override
    public boolean deleteSignalType(Long id) {
        return signalTypeRepo.deleteById(id) > 0;
    }

    @Override
    public List<AiTriggerRule> getAllTriggerRules() {
        return triggerRuleRepo.selectList(null);
    }

    @Override
    public AiTriggerRule createOrUpdateTriggerRule(AiTriggerRule rule) {
        if (rule.getId() == null) {
            rule.setCreatedAt(LocalDateTime.now());
            rule.setUpdatedAt(LocalDateTime.now());
            triggerRuleRepo.insert(rule);
        } else {
            rule.setUpdatedAt(LocalDateTime.now());
            triggerRuleRepo.updateById(rule);
        }
        return rule;
    }

    @Override
    public boolean deleteTriggerRule(Long id) {
        return triggerRuleRepo.deleteById(id) > 0;
    }
}

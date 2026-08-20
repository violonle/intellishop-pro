package com.shoppro.service.impl;

import com.shoppro.entity.SubscriptionPlan;
import com.shoppro.repository.SubscriptionPlanRepository;
import com.shoppro.service.SubscriptionService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository planRepository;

    public SubscriptionServiceImpl(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.selectList(null);
    }

    @Override
    public SubscriptionPlan getPlanById(Long id) {
        return planRepository.selectById(id);
    }

    @Override
    public void updatePlan(SubscriptionPlan plan) {
        planRepository.updateById(plan);
    }
}

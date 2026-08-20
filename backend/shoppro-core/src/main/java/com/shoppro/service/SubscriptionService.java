package com.shoppro.service;

import com.shoppro.entity.SubscriptionPlan;
import java.util.List;

public interface SubscriptionService {
    List<SubscriptionPlan> getAllPlans();

    SubscriptionPlan getPlanById(Long id);

    void updatePlan(SubscriptionPlan plan);
}

package com.shoppro.controller;

import com.shoppro.dto.response.ApiResponse;
import com.shoppro.entity.SubscriptionPlan;
import com.shoppro.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Subscription Management", description = "订阅计划管理接口")
@RestController
@RequestMapping("/subscriptions")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'PLATFORM_ADMIN')")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @Operation(summary = "获取所有订阅计划")
    @GetMapping("/plans")
    public ApiResponse<List<SubscriptionPlan>> getAllPlans() {
        return ApiResponse.success(subscriptionService.getAllPlans());
    }

    @Operation(summary = "获取订阅计划详情")
    @GetMapping("/plans/{id}")
    public ApiResponse<SubscriptionPlan> getPlanById(@PathVariable Long id) {
        return ApiResponse.success(subscriptionService.getPlanById(id));
    }

    @Operation(summary = "更新订阅计划")
    @PutMapping("/plans/{id}")
    public ApiResponse<Void> updatePlan(@PathVariable Long id, @RequestBody SubscriptionPlan plan) {
        plan.setId(id);
        subscriptionService.updatePlan(plan);
        return ApiResponse.success(null);
    }
}

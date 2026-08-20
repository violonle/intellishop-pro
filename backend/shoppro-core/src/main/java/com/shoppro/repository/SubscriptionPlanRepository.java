package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.SubscriptionPlan;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SubscriptionPlanRepository extends BaseMapper<SubscriptionPlan> {
}

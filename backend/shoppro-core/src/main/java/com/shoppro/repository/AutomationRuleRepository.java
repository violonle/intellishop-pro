package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.AutomationRule;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AutomationRuleRepository extends BaseMapper<AutomationRule> {
}

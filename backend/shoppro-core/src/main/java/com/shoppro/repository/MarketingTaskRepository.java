package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.MarketingTask;
import org.springframework.stereotype.Repository;

/**
 * 营销任务数据访问层
 */
@Repository
public interface MarketingTaskRepository extends BaseMapper<MarketingTask> {
}

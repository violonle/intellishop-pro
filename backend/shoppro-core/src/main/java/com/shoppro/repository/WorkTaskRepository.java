package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.WorkTask;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * Sales Work Tasks Repository
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Mapper
public interface WorkTaskRepository extends BaseMapper<WorkTask> {
}

package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.FissionTask;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * Marketing Fission Tasks Repository
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Mapper
public interface FissionTaskRepository extends BaseMapper<FissionTask> {
}

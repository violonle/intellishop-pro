package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.SopTemplate;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * SOP Templates Repository
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Mapper
public interface SopTemplateRepository extends BaseMapper<SopTemplate> {
}

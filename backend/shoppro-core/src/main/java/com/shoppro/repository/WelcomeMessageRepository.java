package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.WelcomeMessage;
import org.apache.ibatis.annotations.Mapper;

/**
 * <p>
 * Channel Welcome Messages Repository
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
@Mapper
public interface WelcomeMessageRepository extends BaseMapper<WelcomeMessage> {
}

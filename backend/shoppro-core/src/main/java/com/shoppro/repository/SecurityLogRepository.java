package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.SecurityLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SecurityLogRepository extends BaseMapper<SecurityLog> {
}

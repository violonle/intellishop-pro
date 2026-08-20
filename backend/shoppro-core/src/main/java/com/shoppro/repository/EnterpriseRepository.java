package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.Enterprise;
import org.springframework.stereotype.Repository;

/**
 * 企业数据访问层
 */
@Repository
public interface EnterpriseRepository extends BaseMapper<Enterprise> {
}

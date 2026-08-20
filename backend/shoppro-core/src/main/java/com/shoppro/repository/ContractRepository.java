package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.Contract;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ContractRepository extends BaseMapper<Contract> {
}

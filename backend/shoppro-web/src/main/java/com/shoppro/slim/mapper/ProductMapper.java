package com.shoppro.slim.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.slim.entity.ProductEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper extends BaseMapper<ProductEntity> {}

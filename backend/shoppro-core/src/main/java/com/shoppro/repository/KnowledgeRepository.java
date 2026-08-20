package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.Knowledge;
import org.apache.ibatis.annotations.Mapper;

/**
 * 知识库内容 Repository
 */
@Mapper
public interface KnowledgeRepository extends BaseMapper<Knowledge> {
}
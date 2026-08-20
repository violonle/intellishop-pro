package com.shoppro.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.shoppro.entity.KnowledgeCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 知识库分类Repository
 * 基于 MyBatis-Plus 的数据访问层
 */
@Mapper
public interface KnowledgeCategoryRepository extends BaseMapper<KnowledgeCategory> {

    /**
     * 获取所有一级分类
     * @return 一级分类列表
     */
    List<KnowledgeCategory> findRootCategories();

    /**
     * 获取指定分类的子分类
     * @param parentId 父分类ID
     * @return 子分类列表
     */
    List<KnowledgeCategory> findSubCategories(@Param("parentId") Long parentId);

    /**
     * 获取分类树（包括所有级别）
     * @return 完整的分类树
     */
    List<KnowledgeCategory> findCategoryTree();
}
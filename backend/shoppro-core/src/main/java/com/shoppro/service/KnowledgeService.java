package com.shoppro.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.Knowledge;

import java.util.List;

/**
 * 知识库服务接口
 */
public interface KnowledgeService extends IService<Knowledge> {

    Knowledge createKnowledge(Knowledge knowledge);

    Knowledge updateKnowledge(Knowledge knowledge);

    boolean deleteKnowledge(Long id);

    Knowledge getById(Long id);

    List<Knowledge> listByCategory(Long categoryId);

    Page<Knowledge> pageList(Page<Knowledge> page, QueryWrapper<Knowledge> queryWrapper);

    boolean incrementViewCount(Long id);

    boolean likeKnowledge(Long id);

    List<Knowledge> listTopViewed(int limit);
}
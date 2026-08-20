package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.Knowledge;
import com.shoppro.repository.KnowledgeRepository;
import com.shoppro.service.KnowledgeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 知识库服务实现
 */
@Service
public class KnowledgeServiceImpl extends ServiceImpl<KnowledgeRepository, Knowledge> implements KnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeServiceImpl.class);

    @Override
    public Knowledge createKnowledge(Knowledge knowledge) {
        knowledge.setCreatedAt(LocalDateTime.now());
        knowledge.setUpdatedAt(LocalDateTime.now());
        knowledge.setDeleted(0);
        this.save(knowledge);
        return knowledge;
    }

    @Override
    public Knowledge updateKnowledge(Knowledge knowledge) {
        knowledge.setUpdatedAt(LocalDateTime.now());
        this.updateById(knowledge);
        return knowledge;
    }

    @Override
    public boolean deleteKnowledge(Long id) {
        UpdateWrapper<Knowledge> wrapper = new UpdateWrapper<>();
        wrapper.eq("id", id).set("deleted", 1).set("updated_at", LocalDateTime.now());
        return this.update(wrapper);
    }

    @Override
    public Knowledge getById(Long id) {
        return this.baseMapper.selectById(id);
    }

    @Override
    public List<Knowledge> listByCategory(Long categoryId) {
        QueryWrapper<Knowledge> wrapper = new QueryWrapper<>();
        wrapper.eq("category_id", categoryId).eq("deleted", 0).orderByDesc("updated_at");
        return this.baseMapper.selectList(wrapper);
    }

    @Override
    public Page<Knowledge> pageList(Page<Knowledge> page, QueryWrapper<Knowledge> queryWrapper) {
        return this.baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public boolean incrementViewCount(Long id) {
        UpdateWrapper<Knowledge> wrapper = new UpdateWrapper<>();
        wrapper.eq("id", id).setSql("view_count = view_count + 1");
        int affected = this.baseMapper.update(null, wrapper);
        if (affected == 0) {
            log.warn("incrementViewCount no rows affected for id:{}", id);
        }
        return affected > 0;
    }

    @Override
    public boolean likeKnowledge(Long id) {
        UpdateWrapper<Knowledge> wrapper = new UpdateWrapper<>();
        wrapper.eq("id", id).setSql("like_count = like_count + 1");
        int affected = this.baseMapper.update(null, wrapper);
        if (affected == 0) {
            log.warn("likeKnowledge no rows affected for id:{}", id);
        }
        return affected > 0;
    }

    @Override
    public List<Knowledge> listTopViewed(int limit) {
        QueryWrapper<Knowledge> wrapper = new QueryWrapper<>();
        wrapper.eq("deleted", 0).orderByDesc("view_count").last("limit " + limit);
        return this.baseMapper.selectList(wrapper);
    }
}
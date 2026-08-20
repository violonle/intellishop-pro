package com.shoppro.slim.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.slim.entity.LeadEntity;
import com.shoppro.slim.mapper.LeadMapper;
import org.springframework.stereotype.Service;

@Service
public class LeadServiceSlim {
    private final LeadMapper leadMapper;
    public LeadServiceSlim(LeadMapper leadMapper) { this.leadMapper = leadMapper; }

    public Page<LeadEntity> page(int page, int size, String keyword, String status) {
        LambdaQueryWrapper<LeadEntity> q = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) q.eq(LeadEntity::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) q.like(LeadEntity::getTitle, keyword);
        return leadMapper.selectPage(new Page<>(page, size), q.orderByDesc(LeadEntity::getCreatedAt));
    }

    public LeadEntity get(Long id) { return leadMapper.selectById(id); }
    public LeadEntity create(LeadEntity e) { leadMapper.insert(e); return e; }
    public LeadEntity update(Long id, LeadEntity e) { e.setId(id); leadMapper.updateById(e); return leadMapper.selectById(id); }
    public void delete(Long id) { leadMapper.deleteById(id); }
}

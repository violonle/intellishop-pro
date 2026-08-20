package com.shoppro.slim.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.slim.entity.CustomerEntity;
import com.shoppro.slim.mapper.CustomerMapper;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceSlim {
    private final CustomerMapper customerMapper;
    public CustomerServiceSlim(CustomerMapper customerMapper) { this.customerMapper = customerMapper; }

    public Page<CustomerEntity> page(int page, int size, String keyword, String level) {
        LambdaQueryWrapper<CustomerEntity> q = new LambdaQueryWrapper<>();
        if (level != null && !level.isEmpty()) q.eq(CustomerEntity::getLevel, level);
        if (keyword != null && !keyword.isEmpty()) q.like(CustomerEntity::getName, keyword);
        return customerMapper.selectPage(new Page<>(page, size), q.orderByDesc(CustomerEntity::getCreatedAt));
    }

    public CustomerEntity get(Long id) { return customerMapper.selectById(id); }
    public CustomerEntity create(CustomerEntity e) { customerMapper.insert(e); return e; }
    public CustomerEntity update(Long id, CustomerEntity e) { e.setId(id); customerMapper.updateById(e); return customerMapper.selectById(id); }
    public void delete(Long id) { customerMapper.deleteById(id); }
}

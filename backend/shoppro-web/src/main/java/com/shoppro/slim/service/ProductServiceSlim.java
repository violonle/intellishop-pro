package com.shoppro.slim.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.slim.entity.ProductEntity;
import com.shoppro.slim.mapper.ProductMapper;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceSlim {
    private final ProductMapper productMapper;
    public ProductServiceSlim(ProductMapper productMapper) { this.productMapper = productMapper; }

    public Page<ProductEntity> page(int page, int size, String keyword, String status) {
        LambdaQueryWrapper<ProductEntity> q = new LambdaQueryWrapper<>();
        if (status != null && !status.isEmpty()) q.eq(ProductEntity::getStatus, status);
        if (keyword != null && !keyword.isEmpty()) q.like(ProductEntity::getProductName, keyword);
        return productMapper.selectPage(new Page<>(page, size), q.orderByDesc(ProductEntity::getCreatedAt));
    }

    public ProductEntity get(Long id) { return productMapper.selectById(id); }
    public ProductEntity create(ProductEntity e) { productMapper.insert(e); return e; }
    public ProductEntity update(Long id, ProductEntity e) { e.setId(id); productMapper.updateById(e); return productMapper.selectById(id); }
    public void delete(Long id) { productMapper.deleteById(id); }
}

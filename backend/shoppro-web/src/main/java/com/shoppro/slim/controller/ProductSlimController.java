package com.shoppro.slim.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.slim.entity.ProductEntity;
import com.shoppro.slim.service.ProductServiceSlim;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@RestController
@RequestMapping("/slim/products")
@ConditionalOnProperty(name = "slim.api.enabled", havingValue = "true", matchIfMissing = false)
public class ProductSlimController {
    private final ProductServiceSlim service;
    public ProductSlimController(ProductServiceSlim service) { this.service = service; }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "1") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) String status) {
        Page<ProductEntity> p = service.page(page, size, keyword, status);
        Map<String, Object> resp = new HashMap<>();
        resp.put("content", p.getRecords());
        resp.put("page", p.getCurrent());
        resp.put("size", p.getSize());
        resp.put("total", p.getTotal());
        return resp;
    }

    @GetMapping("/{id}")
    public ProductEntity detail(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public ProductEntity create(@RequestBody ProductEntity e) { return service.create(e); }

    @PutMapping("/{id}")
    public ProductEntity update(@PathVariable Long id, @RequestBody ProductEntity e) { return service.update(id, e); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}

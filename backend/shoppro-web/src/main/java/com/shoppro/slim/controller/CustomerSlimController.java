package com.shoppro.slim.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.slim.entity.CustomerEntity;
import com.shoppro.slim.service.CustomerServiceSlim;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@RestController
@RequestMapping("/slim/customers")
@ConditionalOnProperty(name = "slim.api.enabled", havingValue = "true", matchIfMissing = false)
public class CustomerSlimController {
    private final CustomerServiceSlim service;
    public CustomerSlimController(CustomerServiceSlim service) { this.service = service; }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "1") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) String level) {
        Page<CustomerEntity> p = service.page(page, size, keyword, level);
        Map<String, Object> resp = new HashMap<>();
        resp.put("content", p.getRecords());
        resp.put("page", p.getCurrent());
        resp.put("size", p.getSize());
        resp.put("total", p.getTotal());
        return resp;
    }

    @GetMapping("/{id}")
    public CustomerEntity detail(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public CustomerEntity create(@RequestBody CustomerEntity e) { return service.create(e); }

    @PutMapping("/{id}")
    public CustomerEntity update(@PathVariable Long id, @RequestBody CustomerEntity e) { return service.update(id, e); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}

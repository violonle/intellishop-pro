package com.shoppro.slim.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.slim.entity.LeadEntity;
import com.shoppro.slim.service.LeadServiceSlim;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@RestController
@RequestMapping("/slim/leads")
@ConditionalOnProperty(name = "slim.api.enabled", havingValue = "true", matchIfMissing = false)
public class LeadSlimController {
    private final LeadServiceSlim service;
    public LeadSlimController(LeadServiceSlim service) { this.service = service; }

    @GetMapping
    public Map<String, Object> list(@RequestParam(defaultValue = "1") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) String status) {
        Page<LeadEntity> p = service.page(page, size, keyword, status);
        Map<String, Object> resp = new HashMap<>();
        resp.put("content", p.getRecords());
        resp.put("page", p.getCurrent());
        resp.put("size", p.getSize());
        resp.put("total", p.getTotal());
        return resp;
    }

    @GetMapping("/{id}")
    public LeadEntity detail(@PathVariable Long id) { return service.get(id); }

    @PostMapping
    public LeadEntity create(@RequestBody LeadEntity e) { return service.create(e); }

    @PutMapping("/{id}")
    public LeadEntity update(@PathVariable Long id, @RequestBody LeadEntity e) { return service.update(id, e); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}

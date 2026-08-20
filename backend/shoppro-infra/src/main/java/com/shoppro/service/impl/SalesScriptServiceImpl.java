package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.SalesScript;
import com.shoppro.repository.SalesScriptRepository;
import com.shoppro.service.SalesScriptService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalesScriptServiceImpl extends ServiceImpl<SalesScriptRepository, SalesScript>
        implements SalesScriptService {

    @Override
    public List<SalesScript> getScriptsByCategory(String category) {
        if ("all".equals(category) || category == null) {
            return this.list();
        }
        return this.list(new QueryWrapper<SalesScript>().eq("category", category));
    }

    @Override
    public List<SalesScript> getRecommendedScripts(Long customerId, String scenario) {
        // Simple Logic: Return top 2 recommended scripts
        return this.list(new QueryWrapper<SalesScript>()
                .eq("is_recommended", true)
                .orderByDesc("usage_count")
                .last("LIMIT 2"));
    }

}

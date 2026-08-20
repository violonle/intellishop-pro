package com.shoppro.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.SalesScript;

import java.util.List;

public interface SalesScriptService extends IService<SalesScript> {
    List<SalesScript> getScriptsByCategory(String category);

    List<SalesScript> getRecommendedScripts(Long customerId, String scenario);

}

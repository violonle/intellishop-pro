package com.shoppro.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.CustomerPersona;

import java.util.List;
import java.util.Map;

public interface CustomerPersonaService extends IService<CustomerPersona> {
    List<Map<String, Object>> getPersonas();

    Map<String, Object> getPersonaDetail(Long id);

    long countNewPersonasToday();

}

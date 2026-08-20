package com.shoppro.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shoppro.entity.CustomerPersona;
import com.shoppro.repository.CustomerPersonaRepository;
import com.shoppro.service.CustomerPersonaService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class CustomerPersonaServiceImpl extends ServiceImpl<CustomerPersonaRepository, CustomerPersona>
        implements CustomerPersonaService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<Map<String, Object>> getPersonas() {
        List<CustomerPersona> personas = this.list();
        List<Map<String, Object>> result = new ArrayList<>();

        for (CustomerPersona p : personas) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> analysis = objectMapper.readValue(p.getAnalysisJson(), Map.class);
                analysis.put("id", p.getId());
                analysis.put("score", p.getScore());
                analysis.put("tags", Arrays.asList(p.getTags().split(",")));
                result.add(analysis);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    @Override
    public Map<String, Object> getPersonaDetail(Long id) {
        CustomerPersona p = this.getById(id);
        if (p == null)
            return null;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> analysis = objectMapper.readValue(p.getAnalysisJson(), Map.class);
            analysis.put("id", p.getId());
            analysis.put("score", p.getScore());
            // Safe robust parsing for tags
            String tagsStr = p.getTags();
            if (tagsStr != null && tagsStr.startsWith("[")) {
                analysis.put("tags", objectMapper.readValue(tagsStr, List.class));
            } else {
                analysis.put("tags", tagsStr != null ? Arrays.asList(tagsStr.split(",")) : Collections.emptyList());
            }
            return analysis;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public long countNewPersonasToday() {
        LocalDateTime startOfDay = LocalDateTime.now().with(java.time.LocalTime.MIN);
        return this.count(new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<CustomerPersona>()
                .ge(CustomerPersona::getGeneratedAt, startOfDay));
    }

}

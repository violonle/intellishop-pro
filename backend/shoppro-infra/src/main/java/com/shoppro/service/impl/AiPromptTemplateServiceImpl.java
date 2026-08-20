package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.AiPromptTemplate;
import com.shoppro.repository.AiPromptTemplateRepository;
import com.shoppro.service.AiPromptTemplateService;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AiPromptTemplateServiceImpl extends ServiceImpl<AiPromptTemplateRepository, AiPromptTemplate>
        implements AiPromptTemplateService {

    @Override
    public AiPromptTemplate getByCode(String code) {
        return this.getOne(new LambdaQueryWrapper<AiPromptTemplate>().eq(AiPromptTemplate::getCode, code));
    }

    @Override
    public String renderPrompt(String code, Map<String, Object> params) {
        AiPromptTemplate template = getByCode(code);
        if (template == null) {
            throw new RuntimeException("Prompt template not found: " + code);
        }

        String content = template.getContent();
        if (params != null) {
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                String key = "{" + entry.getKey() + "}";
                String value = entry.getValue() != null ? entry.getValue().toString() : "N/A";
                content = content.replace(key, value);
            }
        }
        return content;
    }
}

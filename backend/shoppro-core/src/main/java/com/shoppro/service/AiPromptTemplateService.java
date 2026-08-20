package com.shoppro.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.AiPromptTemplate;

import java.util.Map;

public interface AiPromptTemplateService extends IService<AiPromptTemplate> {
    AiPromptTemplate getByCode(String code);

    String renderPrompt(String code, Map<String, Object> params);
}

package com.shoppro.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.shoppro.entity.AiScenario;

import java.util.List;

public interface AiScenarioService extends IService<AiScenario> {
    /**
     * Get scenario by code
     */
    AiScenario getByCode(String code);

    /**
     * Get all enabled scenarios
     */
    List<AiScenario> getEnabledScenarios();

    /**
     * Update model for all scenarios in a category
     */
    void updateCategoryModel(String category, String modelName);
}

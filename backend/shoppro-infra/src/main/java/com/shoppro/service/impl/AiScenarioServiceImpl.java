package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.shoppro.entity.AiScenario;
import com.shoppro.repository.AiScenarioRepository;
import com.shoppro.service.AiScenarioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AiScenarioServiceImpl extends ServiceImpl<AiScenarioRepository, AiScenario> implements AiScenarioService {

    public AiScenarioServiceImpl(AiScenarioRepository repository) {
        super();
        this.baseMapper = repository;
    }

    @Override
    @Transactional
    public void updateCategoryModel(String category, String modelName) {
        List<AiScenario> scenarios = this.list(new QueryWrapper<AiScenario>().eq("category", category));
        for (AiScenario scenario : scenarios) {
            String currentConfig = scenario.getModelConfig();
            // Simple string replacement for now, or use Jackson if needed.
            // Assuming simplified config for this task to avoid complex parsing deps if not
            // already imported
            // But we should use robust JSON parsing if possible.
            // Let's use simple replacement for the 'model' field
            // "model": "gpt-4" -> "model": "new-model"
            String newConfig = currentConfig.replaceAll("\"model\":\\s*\"[^\"]+\"", "\"model\": \"" + modelName + "\"");
            scenario.setModelConfig(newConfig);
            scenario.setUpdatedAt(LocalDateTime.now());
        }
        this.updateBatchById(scenarios);
    }

    @Override
    public AiScenario getByCode(String code) {
        return this.getOne(new QueryWrapper<AiScenario>().eq("code", code));
    }

    @Override
    public List<AiScenario> getEnabledScenarios() {
        return this.list(new QueryWrapper<AiScenario>().eq("is_enabled", true));
    }

}

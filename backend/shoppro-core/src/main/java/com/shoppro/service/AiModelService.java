package com.shoppro.service;

import com.shoppro.entity.AiModel;
import java.util.List;

public interface AiModelService {
    List<AiModel> getAllModels();

    AiModel createModel(AiModel model);

    AiModel updateModel(Long id, AiModel model);

    void deleteModel(Long id);

    void toggleStatus(Long id);
}

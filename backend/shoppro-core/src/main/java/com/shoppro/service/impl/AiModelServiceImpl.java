package com.shoppro.service.impl;

import com.shoppro.entity.AiModel;
import com.shoppro.repository.AiModelRepository;
import com.shoppro.service.AiModelService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AiModelServiceImpl implements AiModelService {

    private final AiModelRepository repository;

    public AiModelServiceImpl(AiModelRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<AiModel> getAllModels() {
        return repository.selectList(null);
    }

    @Override
    @Transactional
    public AiModel createModel(AiModel model) {
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());
        repository.insert(model);
        return model;
    }

    @Override
    @Transactional
    public AiModel updateModel(Long id, AiModel model) {
        model.setId(id);
        model.setUpdatedAt(LocalDateTime.now());
        repository.updateById(model);
        return model;
    }

    @Override
    @Transactional
    public void deleteModel(Long id) {
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        AiModel model = repository.selectById(id);
        if (model != null) {
            model.setStatus(model.getStatus() == 1 ? 0 : 1);
            model.setUpdatedAt(LocalDateTime.now());
            repository.updateById(model);
        }
    }

}

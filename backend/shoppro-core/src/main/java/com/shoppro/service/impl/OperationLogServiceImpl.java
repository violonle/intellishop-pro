package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.OperationLog;
import com.shoppro.repository.OperationLogRepository;
import com.shoppro.service.OperationLogService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OperationLogServiceImpl implements OperationLogService {

    private final OperationLogRepository repository;

    public OperationLogServiceImpl(OperationLogRepository repository) {
        this.repository = repository;
    }

    @Override
    public Page<OperationLog> getLogPage(int pageNo, int pageSize, String username, String module) {
        Page<OperationLog> page = new Page<>(pageNo, pageSize);
        QueryWrapper<OperationLog> queryWrapper = new QueryWrapper<>();
        if (username != null && !username.isEmpty()) {
            queryWrapper.like("user_name", username);
        }
        if (module != null && !module.isEmpty()) {
            queryWrapper.like("title", module);
        }
        queryWrapper.orderByDesc("created_at");
        return repository.selectPage(page, queryWrapper);
    }

    @Override
    public void saveLog(OperationLog log) {
        log.setCreatedAt(LocalDateTime.now());
        repository.insert(log);
    }
}

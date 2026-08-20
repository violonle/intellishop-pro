package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.AiAgentConfig;
import com.shoppro.entity.AiAgentTask;
import com.shoppro.repository.AiAgentConfigRepository;
import com.shoppro.repository.AiAgentTaskRepository;
import com.shoppro.service.AgentService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AgentServiceImpl implements AgentService {

    private final AiAgentConfigRepository configRepo;
    private final AiAgentTaskRepository taskRepo;

    public AgentServiceImpl(AiAgentConfigRepository configRepo, AiAgentTaskRepository taskRepo) {
        this.configRepo = configRepo;
        this.taskRepo = taskRepo;
    }

    @Override
    public List<AiAgentConfig> getAllAgentConfigs() {
        return configRepo.selectList(null);
    }

    @Override
    public AiAgentConfig updateAgentConfig(String agentType, AiAgentConfig updateDto) {
        QueryWrapper<AiAgentConfig> qw = new QueryWrapper<>();
        qw.eq("agent_type", agentType);
        AiAgentConfig existing = configRepo.selectOne(qw);
        if (existing != null) {
            if (updateDto.getName() != null) existing.setName(updateDto.getName());
            if (updateDto.getDescription() != null) existing.setDescription(updateDto.getDescription());
            if (updateDto.getIsEnabled() != null) existing.setIsEnabled(updateDto.getIsEnabled());
            if (updateDto.getExecutionFrequency() != null) existing.setExecutionFrequency(updateDto.getExecutionFrequency());
            if (updateDto.getTriggerThreshold() != null) existing.setTriggerThreshold(updateDto.getTriggerThreshold());
            if (updateDto.getRequireConfirmation() != null) existing.setRequireConfirmation(updateDto.getRequireConfirmation());
            existing.setUpdatedAt(LocalDateTime.now());
            configRepo.updateById(existing);
            return existing;
        }
        return null;
    }

    @Override
    public Map<String, Object> getAgentsSummary() {
        Map<String, Object> summary = new HashMap<>();
        List<AiAgentConfig> configs = configRepo.selectList(null);
        
        QueryWrapper<AiAgentTask> pendingQw = new QueryWrapper<>();
        pendingQw.eq("status", "pending");
        Long pendingCount = taskRepo.selectCount(pendingQw);

        QueryWrapper<AiAgentTask> totalQw = new QueryWrapper<>();
        Long totalCount = taskRepo.selectCount(totalQw);

        summary.put("configs", configs);
        summary.put("todayExecutedTasks", totalCount != null ? totalCount : 0);
        summary.put("pendingTasks", pendingCount != null ? pendingCount : 0);
        summary.put("activeAgentsCount", configs.stream().filter(c -> Integer.valueOf(1).equals(c.getIsEnabled())).count());
        return summary;
    }

    @Override
    public List<AiAgentTask> getTasksByAgentType(String agentType, String status) {
        QueryWrapper<AiAgentTask> qw = new QueryWrapper<>();
        if (agentType != null && !agentType.isEmpty() && !"all".equalsIgnoreCase(agentType)) {
            qw.eq("agent_type", agentType);
        }
        if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status)) {
            qw.eq("status", status);
        }
        qw.orderByDesc("created_at");
        return taskRepo.selectList(qw);
    }

    @Override
    public AiAgentTask getTaskById(Long id) {
        return taskRepo.selectById(id);
    }

    @Override
    public boolean confirmTask(Long taskId) {
        AiAgentTask task = taskRepo.selectById(taskId);
        if (task != null) {
            task.setStatus("confirmed");
            task.setExecutionResult("销售代表已确认并发送觸达方案");
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepo.updateById(task) > 0;
        }
        return false;
    }

    @Override
    public boolean rejectTask(Long taskId, String feedback) {
        AiAgentTask task = taskRepo.selectById(taskId);
        if (task != null) {
            task.setStatus("rejected");
            task.setFeedback(feedback != null ? feedback : "方案不合适");
            task.setExecutionResult("已驳回该任务");
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepo.updateById(task) > 0;
        }
        return false;
    }

    @Override
    public List<AiAgentTask> getAllTaskLogs(String agentType, String status, int pageNo, int pageSize) {
        QueryWrapper<AiAgentTask> qw = new QueryWrapper<>();
        if (agentType != null && !agentType.isEmpty() && !"all".equalsIgnoreCase(agentType)) {
            qw.eq("agent_type", agentType);
        }
        if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status)) {
            qw.eq("status", status);
        }
        qw.orderByDesc("created_at");
        Page<AiAgentTask> page = new Page<>(pageNo, pageSize);
        return taskRepo.selectPage(page, qw).getRecords();
    }
}

package com.shoppro.service;

import com.shoppro.entity.AiAgentConfig;
import com.shoppro.entity.AiAgentTask;

import java.util.List;
import java.util.Map;

public interface AgentService {
    List<AiAgentConfig> getAllAgentConfigs();
    AiAgentConfig updateAgentConfig(String agentType, AiAgentConfig config);
    Map<String, Object> getAgentsSummary();
    List<AiAgentTask> getTasksByAgentType(String agentType, String status);
    AiAgentTask getTaskById(Long id);
    boolean confirmTask(Long taskId);
    boolean rejectTask(Long taskId, String feedback);
    List<AiAgentTask> getAllTaskLogs(String agentType, String status, int pageNo, int pageSize);
}

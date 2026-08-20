package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.MarketingTask;

/**
 * 营销服务接口
 */
public interface MarketingService {
    /**
     * 创建营销任务
     */
    MarketingTask createTask(MarketingTask task);

    /**
     * 启动/调度任务
     */
    void startTask(Long taskId);

    /**
     * 暂停任务
     */
    void stopTask(Long taskId);

    /**
     * 分页查询任务
     */
    Page<MarketingTask> pageTasks(int pageNo, int pageSize, String name);

    /**
     * 获取发送记录 (此处简化为获取任务摘要)
     */
    MarketingTask getTaskSummary(Long taskId);
}

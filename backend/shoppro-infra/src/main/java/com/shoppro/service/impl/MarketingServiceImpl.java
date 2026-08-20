package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.MarketingTask;
import com.shoppro.repository.MarketingTaskRepository;
import com.shoppro.service.MarketingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 营销服务实现类
 * 集成 Quartz 进行任务调度
 */

/**
 * 营销服务实现类
 * 集成 Quartz 进行任务调度
 */
@Service
public class MarketingServiceImpl implements MarketingService {

    private static final Logger log = LoggerFactory.getLogger(MarketingServiceImpl.class);

    private final MarketingTaskRepository taskRepository;
    private final Scheduler scheduler;

    public MarketingServiceImpl(MarketingTaskRepository taskRepository, Scheduler scheduler) {
        this.taskRepository = taskRepository;
        this.scheduler = scheduler;
    }

    @Override
    @Transactional
    public MarketingTask createTask(MarketingTask task) {
        task.setStatus(0); // 待启动
        taskRepository.insert(task);
        return task;
    }

    @Override
    @Transactional
    public void startTask(Long taskId) {
        MarketingTask task = taskRepository.selectById(taskId);
        if (task == null)
            return;

        try {
            JobDetail jobDetail = JobBuilder.newJob(MarketingJob.class)
                    .withIdentity("marketing_job_" + taskId, "marketing_group")
                    .usingJobData("taskId", taskId)
                    .build();

            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity("marketing_trigger_" + taskId, "marketing_group")
                    .withSchedule(CronScheduleBuilder.cronSchedule(task.getCronExpression()))
                    .build();

            scheduler.scheduleJob(jobDetail, trigger);

            task.setStatus(1); // 运行中
            taskRepository.updateById(task);
            log.info("营销任务 {} 已成功启动调度", task.getName());
        } catch (SchedulerException e) {
            log.error("启动营销任务调度失败: {}", e.getMessage());
            throw new RuntimeException("调度失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void stopTask(Long taskId) {
        MarketingTask task = taskRepository.selectById(taskId);
        if (task == null)
            return;

        try {
            scheduler.deleteJob(new JobKey("marketing_job_" + taskId, "marketing_group"));
            task.setStatus(2); // 已停止
            taskRepository.updateById(task);
        } catch (SchedulerException e) {
            log.error("停止营销营销任务调度失败: {}", e.getMessage());
        }
    }

    @Override
    public Page<MarketingTask> pageTasks(int pageNo, int pageSize, String name) {
        Page<MarketingTask> page = new Page<>(pageNo, pageSize);
        LambdaQueryWrapper<MarketingTask> queryWrapper = new LambdaQueryWrapper<>();
        if (name != null) {
            queryWrapper.like(MarketingTask::getName, name);
        }
        return taskRepository.selectPage(page, queryWrapper);
    }

    @Override
    public MarketingTask getTaskSummary(Long taskId) {
        return taskRepository.selectById(taskId);
    }

    /**
     * 内部 Job 类
     */
    public static class MarketingJob implements Job {
        @Override
        public void execute(JobExecutionContext context) {
            Long taskId = context.getJobDetail().getJobDataMap().getLong("taskId");
            System.out.println("执行营销任务 ID: " + taskId);
        }
    }
}

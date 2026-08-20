package com.shoppro.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.FollowUpRecord;

import java.util.List;
import java.util.Map;

/**
 * 跟进记录业务层接口
 */
public interface FollowUpRecordService {

    // 分页查询跟进记录列表
    Page<FollowUpRecord> listFollowUps(int pageNo, int pageSize, Map<String, Object> filters);

    // 获取待提醒的跟进记录
    List<FollowUpRecord> getPendingReminders();

    // 创建跟进记录
    FollowUpRecord createFollowUp(FollowUpRecord followUp, Long userId);

    // 获取跟进记录详情
    FollowUpRecord getFollowUpDetail(Long id);

    // 更新跟进记录
    FollowUpRecord updateFollowUp(FollowUpRecord followUp);

    // 删除跟进记录
    boolean deleteFollowUp(Long id);

    // 获取用户的跟进记录（分页）
    Page<FollowUpRecord> getFollowUpsByUser(Long userId, int pageNo, int pageSize);

    // 获取线索的所有跟进记录
    List<FollowUpRecord> getFollowUpsByLead(Long leadId);

    // 获取客户的所有跟进记录
    List<FollowUpRecord> getFollowUpsByCustomer(Long customerId);

    // 获取全局统计
    Map<String, Object> getFollowUpStatistics();

    // 获取用户统计
    Map<String, Object> getUserFollowUpStatistics(Long userId);

    // 按类型统计次数
    Map<String, Long> countFollowUpsByType();

    // 获取逾期、今日、待跟进列表
    List<FollowUpRecord> getOverdueFollowUps();
    List<FollowUpRecord> getTodayFollowUps();
    List<FollowUpRecord> getPendingFollowUps();
}

package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.FollowUpRecord;
import com.shoppro.entity.Lead;
import com.shoppro.entity.Customer;
import com.shoppro.repository.FollowUpRecordRepository;
import com.shoppro.repository.LeadRepository;
import com.shoppro.repository.CustomerRepository;
import com.shoppro.service.FollowUpRecordService;
import com.shoppro.service.DataScopeService;
import com.shoppro.exception.BusinessException;
import com.shoppro.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 跟进记录服务实现类
 * 提供跟进记录的CRUD、查询、提醒、统计等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
// 移除 @Slf4j 注解，改用显式 Logger
@Service
public class FollowUpRecordServiceImpl implements FollowUpRecordService {

    private static final Logger log = LoggerFactory.getLogger(FollowUpRecordServiceImpl.class);

    private final FollowUpRecordRepository followUpRecordRepository;
    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final DataScopeService dataScopeService;

    public FollowUpRecordServiceImpl(FollowUpRecordRepository followUpRecordRepository,
                                     LeadRepository leadRepository,
                                     CustomerRepository customerRepository,
                                     DataScopeService dataScopeService) {
        this.followUpRecordRepository = followUpRecordRepository;
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.dataScopeService = dataScopeService;
    }

    /**
     * 分页查询跟进记录列表
     */
    @Override
    public Page<FollowUpRecord> listFollowUps(int pageNo, int pageSize, Map<String, Object> filters) {
        Page<FollowUpRecord> page = new Page<>(pageNo, pageSize);
        LambdaQueryWrapper<FollowUpRecord> wrapper = new LambdaQueryWrapper<>();

        if (filters != null) {
            // 按线索过滤
            if (filters.containsKey("leadId")) {
                wrapper.eq(FollowUpRecord::getLeadId, filters.get("leadId"));
            }

            // 按客户过滤
            if (filters.containsKey("customerId")) {
                wrapper.eq(FollowUpRecord::getCustomerId, filters.get("customerId"));
            }

            // 按用户过滤
            if (filters.containsKey("userId")) {
                wrapper.eq(FollowUpRecord::getUserId, filters.get("userId"));
            }

            // 按跟进方式过滤
            if (filters.containsKey("type")) {
                wrapper.eq(FollowUpRecord::getType, filters.get("type"));
            }

            // 按结果过滤
            if (filters.containsKey("result")) {
                wrapper.eq(FollowUpRecord::getResult, filters.get("result"));
            }

            // 按日期范围过滤
            if (filters.containsKey("startDate")) {
                wrapper.ge(FollowUpRecord::getCreatedAt, filters.get("startDate"));
            }
            if (filters.containsKey("endDate")) {
                wrapper.le(FollowUpRecord::getCreatedAt, filters.get("endDate"));
            }
        }

        DataScopeService.Scope scope = dataScopeService.current();
        if (scope.isSelfScope()) {
            wrapper.eq(FollowUpRecord::getUserId, scope.userId());
        }

        wrapper.orderByDesc(FollowUpRecord::getCreatedAt);
        return followUpRecordRepository.selectPage(page, wrapper);
    }

    /**
     * 获取待提醒的跟进记录
     */
    @Override
    public List<FollowUpRecord> getPendingReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourLater = now.plusHours(1);

        return accessible(followUpRecordRepository.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .isNotNull(FollowUpRecord::getNextFollowUpDate)
                        .ge(FollowUpRecord::getNextFollowUpDate, now)
                        .le(FollowUpRecord::getNextFollowUpDate, oneHourLater)
        ));
    }

    /**
     * 创建跟进记录
     */
    @Override
    @Transactional
    public FollowUpRecord createFollowUp(FollowUpRecord followUp, Long userId) {
        if (followUp == null) {
            throw new BusinessException("跟进记录信息不能为空");
        }

        // 参数验证
        if (followUp.getTitle() == null || followUp.getTitle().isEmpty()) {
            throw new BusinessException("跟进标题不能为空");
        }

        if (followUp.getType() == null || followUp.getType().isEmpty()) {
            throw new BusinessException("跟进方式不能为空");
        }

        // 验证线索或客户至少有一个
        if ((followUp.getLeadId() == null || followUp.getLeadId() <= 0) &&
            (followUp.getCustomerId() == null || followUp.getCustomerId() <= 0)) {
            throw new BusinessException("请关联线索或客户");
        }

        if (followUp.getLeadId() != null && !dataScopeService.canAccess(leadRepository.selectById(followUp.getLeadId()))) {
            throw new BusinessException("无权为该线索创建跟进");
        }
        if (followUp.getCustomerId() != null && !dataScopeService.canAccess(customerRepository.selectById(followUp.getCustomerId()))) {
            throw new BusinessException("无权为该客户创建跟进");
        }

        // 设置创建信息
        followUp.setUserId(userId);
        followUp.setCreatedAt(LocalDateTime.now());

        // 保存
        boolean result = followUpRecordRepository.insert(followUp) > 0;
        if (!result) {
            throw new BusinessException("跟进记录创建失败");
        }

        log.info("跟进记录创建成功: id={}, title={}", followUp.getId(), followUp.getTitle());
        return followUp;
    }

    /**
     * 更新跟进记录
     */
    @Override
    @Transactional
    public FollowUpRecord updateFollowUp(FollowUpRecord followUp) {
        if (followUp == null || followUp.getId() == null || followUp.getId() <= 0) {
            throw new BusinessException("跟进记录ID无效");
        }

        FollowUpRecord existing = followUpRecordRepository.selectById(followUp.getId());
        if (existing == null) {
            throw new ResourceNotFoundException("跟进记录不存在");
        }
        if (!canAccess(existing)) throw new ResourceNotFoundException("跟进记录不存在");

        boolean result = followUpRecordRepository.updateById(followUp) > 0;
        if (!result) {
            throw new BusinessException("跟进记录更新失败");
        }

        log.info("跟进记录更新成功: id={}", followUp.getId());
        return followUpRecordRepository.selectById(followUp.getId());
    }

    /**
     * 删除跟进记录
     */
    @Override
    @Transactional
    public boolean deleteFollowUp(Long followUpId) {
        if (followUpId == null || followUpId <= 0) {
            throw new BusinessException("跟进记录ID无效");
        }

        FollowUpRecord followUp = followUpRecordRepository.selectById(followUpId);
        if (followUp == null) {
            throw new ResourceNotFoundException("跟进记录不存在");
        }
        if (!canAccess(followUp)) throw new ResourceNotFoundException("跟进记录不存在");

        boolean result = followUpRecordRepository.deleteById(followUpId) > 0;
        if (result) {
            log.info("跟进记录删除成功: id={}", followUpId);
        }

        return result;
    }

    /**
     * 获取跟进详情
     */
    @Override
    public FollowUpRecord getFollowUpDetail(Long followUpId) {
        if (followUpId == null || followUpId <= 0) {
            throw new BusinessException("跟进记录ID无效");
        }

        FollowUpRecord followUp = followUpRecordRepository.selectById(followUpId);
        if (followUp == null) {
            throw new ResourceNotFoundException("跟进记录不存在");
        }
        if (!canAccess(followUp)) throw new ResourceNotFoundException("跟进记录不存在");

        return followUp;
    }

    private boolean canAccess(FollowUpRecord followUp) {
        if (followUp.getLeadId() != null) {
            return dataScopeService.canAccess(leadRepository.selectById(followUp.getLeadId()));
        }
        if (followUp.getCustomerId() != null) {
            return dataScopeService.canAccess(customerRepository.selectById(followUp.getCustomerId()));
        }
        DataScopeService.Scope scope = dataScopeService.current();
        return scope.isAllScope() || (scope.userId() != null && scope.userId().equals(followUp.getUserId()));
    }

    /**
     * 获取用户的跟进记录
     */
    @Override
    public Page<FollowUpRecord> getFollowUpsByUser(Long userId, int pageNo, int pageSize) {
        if (userId == null || userId <= 0) {
            throw new BusinessException("用户ID无效");
        }

        Page<FollowUpRecord> page = new Page<>(pageNo, pageSize);
        LambdaQueryWrapper<FollowUpRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FollowUpRecord::getUserId, userId)
                .orderByDesc(FollowUpRecord::getCreatedAt);

        DataScopeService.Scope scope = dataScopeService.current();
        if (scope.isSelfScope() && !userId.equals(scope.userId())) {
            return new Page<>(pageNo, pageSize);
        }

        return followUpRecordRepository.selectPage(page, wrapper);
    }

    /**
     * 获取线索的所有跟进记录
     */
    @Override
    public List<FollowUpRecord> getFollowUpsByLead(Long leadId) {
        if (leadId == null || leadId <= 0) {
            throw new BusinessException("线索ID无效");
        }

        return accessible(followUpRecordRepository.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .eq(FollowUpRecord::getLeadId, leadId)
                        .orderByDesc(FollowUpRecord::getCreatedAt)
        ));
    }

    /**
     * 获取客户的所有跟进记录
     */
    @Override
    public List<FollowUpRecord> getFollowUpsByCustomer(Long customerId) {
        if (customerId == null || customerId <= 0) {
            throw new BusinessException("客户ID无效");
        }

        return accessible(followUpRecordRepository.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .eq(FollowUpRecord::getCustomerId, customerId)
                        .orderByDesc(FollowUpRecord::getCreatedAt)
        ));
    }

    /**
     * 获取跟进统计信息
     */
    @Override
    public Map<String, Object> getFollowUpStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 总跟进次数
        List<FollowUpRecord> accessibleRecords = accessible(followUpRecordRepository.selectList(null));
        long total = accessibleRecords.size();
        statistics.put("total", total);

        // 按方式统计
        List<String> types = Arrays.asList("call", "email", "wechat", "visit", "sms", "douyin", "other");
        Map<String, Long> typeStats = new HashMap<>();
        for (String type : types) {
            long count = accessibleRecords.stream().filter(record -> type.equals(record.getType())).count();
            typeStats.put(type, count);
        }
        statistics.put("byType", typeStats);

        // 按结果统计
        List<String> results = Arrays.asList("positive", "neutral", "negative");
        Map<String, Long> resultStats = new HashMap<>();
        for (String result : results) {
            long count = accessibleRecords.stream().filter(record -> result.equals(record.getResult())).count();
            resultStats.put(result, count);
        }
        statistics.put("byResult", resultStats);

        // 平均跟进时长
        // TODO: 实现平均时长计算

        return statistics;
    }

    /**
     * 获取逾期的跟进记录
     */
    @Override
    public List<FollowUpRecord> getOverdueFollowUps() {
        LocalDateTime now = LocalDateTime.now();

        return accessible(followUpRecordRepository.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .isNotNull(FollowUpRecord::getNextFollowUpDate)
                        .lt(FollowUpRecord::getNextFollowUpDate, now)
        ));
    }

    /**
     * 获取今天的跟进记录
     */
    @Override
    public List<FollowUpRecord> getTodayFollowUps() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        return accessible(followUpRecordRepository.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .between(FollowUpRecord::getCreatedAt, startOfDay, endOfDay)
                        .orderByDesc(FollowUpRecord::getCreatedAt)
        ));
    }

    /**
     * 获取待跟进的记录（下次跟进时间为今天或今天以前）
     */
    @Override
    public List<FollowUpRecord> getPendingFollowUps() {
        LocalDate today = LocalDate.now();
        LocalDateTime endOfToday = today.atTime(23, 59, 59);

        return accessible(followUpRecordRepository.selectList(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .isNotNull(FollowUpRecord::getNextFollowUpDate)
                        .le(FollowUpRecord::getNextFollowUpDate, endOfToday)
                        .orderByAsc(FollowUpRecord::getNextFollowUpDate)
        ));
    }

    /**
     * 按类型统计跟进次数
     */
    @Override
    public Map<String, Long> countFollowUpsByType() {
        List<String> types = Arrays.asList("call", "email", "wechat", "visit", "sms", "douyin", "other");
        Map<String, Long> counts = new HashMap<>();

        for (String type : types) {
            long count = accessible(followUpRecordRepository.selectList(null)).stream()
                    .filter(record -> type.equals(record.getType())).count();
            counts.put(type, count);
        }

        return counts;
    }

    /**
     * 获取用户的跟进统计
     */
    @Override
    public Map<String, Object> getUserFollowUpStatistics(Long userId) {
        if (userId == null || userId <= 0) {
            throw new BusinessException("用户ID无效");
        }
        DataScopeService.Scope scope = dataScopeService.current();
        if (scope.isSelfScope() && !userId.equals(scope.userId())) {
            return Map.of("total", 0L, "today", 0L, "thisWeek", 0L);
        }

        Map<String, Object> stats = new HashMap<>();

        // 总跟进次数
        long total = followUpRecordRepository.selectCount(
                new LambdaQueryWrapper<FollowUpRecord>().eq(FollowUpRecord::getUserId, userId)
        );
        stats.put("total", total);

        // 今日跟进
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        long todayCount = followUpRecordRepository.selectCount(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .eq(FollowUpRecord::getUserId, userId)
                        .between(FollowUpRecord::getCreatedAt, startOfDay, endOfDay)
        );
        stats.put("today", todayCount);

        // 本周跟进
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
        LocalDateTime weekEndDateTime = today.atTime(23, 59, 59);
        long weekCount = followUpRecordRepository.selectCount(
                new LambdaQueryWrapper<FollowUpRecord>()
                        .eq(FollowUpRecord::getUserId, userId)
                        .between(FollowUpRecord::getCreatedAt, weekStartDateTime, weekEndDateTime)
        );
        stats.put("thisWeek", weekCount);

        return stats;
    }

    private List<FollowUpRecord> accessible(List<FollowUpRecord> records) {
        return records.stream().filter(this::canAccess).collect(Collectors.toList());
    }
}

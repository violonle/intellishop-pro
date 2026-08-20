package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.Customer;
import com.shoppro.entity.Lead;
import com.shoppro.entity.LeadTransfer;
import com.shoppro.entity.User;
import com.shoppro.repository.CustomerRepository;
import com.shoppro.repository.LeadRepository;
import com.shoppro.repository.LeadTransferRepository;
import com.shoppro.repository.UserRepository;
import com.shoppro.service.LeadService;
import com.shoppro.service.DataScopeService;
import com.shoppro.exception.BusinessException;
import com.shoppro.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.ObjectProvider;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 销售线索服务实现类
 * 提供线索的CRUD、搜索、分配、转客户等功能
 *
 * @author ShopPro Team
 * @version 1.0.0
 */
@Service
public class LeadServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<LeadRepository, Lead>
        implements LeadService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(LeadServiceImpl.class);

    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final LeadTransferRepository leadTransferRepository;
    private final DataScopeService dataScopeService;
    private final ObjectProvider<UserRepository> userRepositoryProvider;

    public LeadServiceImpl(LeadRepository leadRepository, CustomerRepository customerRepository, LeadTransferRepository leadTransferRepository,
                           DataScopeService dataScopeService, ObjectProvider<UserRepository> userRepositoryProvider) {
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.leadTransferRepository = leadTransferRepository;
        this.dataScopeService = dataScopeService;
        this.userRepositoryProvider = userRepositoryProvider;
    }

    /**
     * 分页查询线索列表
     */
    @Override
    public Page<Lead> listLeads(int pageNo, int pageSize, Map<String, Object> filters) {
        Page<Lead> page = new Page<>(pageNo, pageSize);

        QueryWrapper<Lead> wrapper = new QueryWrapper<>();

        // 构建查询条件
        if (filters != null) {
            // 按优先级过滤
            if (filters.containsKey("priority")) {
                wrapper.eq("priority", filters.get("priority"));
            }

            // 按状态过滤
            if (filters.containsKey("status")) {
                wrapper.eq("status", filters.get("status"));
            }

            // 按分配人过滤
            if (filters.containsKey("assignedTo")) {
                wrapper.eq("assigned_to", filters.get("assignedTo"));
            }

            // 按来源过滤
            if (filters.containsKey("source")) {
                wrapper.eq("source", filters.get("source"));
            }

            // 按销售阶段过滤
            if (filters.containsKey("stage")) {
                wrapper.eq("stage", filters.get("stage"));
            }

            // 按预估价值范围过滤
            if (filters.containsKey("minValue")) {
                wrapper.ge("estimated_value", filters.get("minValue"));
            }
            if (filters.containsKey("maxValue")) {
                wrapper.le("estimated_value", filters.get("maxValue"));
            }

            // 按AI预测成功率范围过滤
            if (filters.containsKey("minProbability")) {
                wrapper.ge("success_probability", filters.get("minProbability"));
            }
            if (filters.containsKey("maxProbability")) {
                wrapper.le("success_probability", filters.get("maxProbability"));
            }
        }

        dataScopeService.applyLeadScope(wrapper);

        wrapper.orderByDesc("created_at");
        return leadRepository.selectPage(page, wrapper);
    }

    /**
     * 搜索线索
     */
    @Override
    public Page<Lead> searchLeads(String keyword, int pageNo, int pageSize) {
        if (keyword == null || keyword.isEmpty()) {
            throw new BusinessException("搜索关键词不能为空");
        }

        Page<Lead> page = new Page<>(pageNo, pageSize);
        QueryWrapper<Lead> wrapper = new QueryWrapper<>();

        // 按标题、描述搜索
        wrapper.and(w -> w
                .like("title", keyword)
                .or()
                .like("description", keyword));
        dataScopeService.applyLeadScope(wrapper);

        wrapper.orderByDesc("created_at");
        return leadRepository.selectPage(page, wrapper);
    }

    /**
     * 获取线索详情
     */
    @Override
    public Lead getLeadDetail(Long leadId) {
        if (leadId == null || leadId <= 0) {
            throw new BusinessException("线索ID无效");
        }

        Lead lead = leadRepository.selectById(leadId);
        if (lead == null) {
            throw new ResourceNotFoundException("线索不存在");
        }

        if (!dataScopeService.canAccess(lead)) {
            throw new ResourceNotFoundException("线索不存在");
        }
        return lead;
    }

    /**
     * 创建线索
     */
    @Override
    @Transactional
    public Lead createLead(Lead lead, Long createdBy) {
        if (lead == null) {
            throw new BusinessException("线索信息不能为空");
        }

        // 参数验证
        if (lead.getTitle() == null || lead.getTitle().isEmpty()) {
            throw new BusinessException("线索标题不能为空");
        }

        // 设置创建信息
        lead.setCreatedBy(createdBy);
        lead.setCreatedAt(LocalDateTime.now());
        lead.setUpdatedAt(LocalDateTime.now());

        // 如果没设置状态，默认为新线索
        if (lead.getStatus() == null) {
            lead.setStatus("new");
        }

        // 如果没设置优先级，默认为中等
        if (lead.getPriority() == null) {
            lead.setPriority("medium");
        }
        dataScopeService.applyDefaults(lead, createdBy);

        // 保存线索
        boolean result = leadRepository.insert(lead) > 0;
        if (!result) {
            throw new BusinessException("线索创建失败");
        }

        log.info("线索创建成功: id={}, title={}", lead.getId(), lead.getTitle());
        return lead;
    }

    /**
     * 更新线索
     */
    @Override
    @Transactional
    public Lead updateLead(Lead lead, Long updatedBy) {
        if (lead == null || lead.getId() == null || lead.getId() <= 0) {
            throw new BusinessException("线索ID无效");
        }

        // 检查线索是否存在
        Lead existing = leadRepository.selectById(lead.getId());
        if (existing == null) {
            throw new ResourceNotFoundException("线索不存在");
        }
        if (!dataScopeService.canAccess(existing)) {
            throw new ResourceNotFoundException("线索不存在");
        }

        // 更新信息
        lead.setUpdatedAt(LocalDateTime.now());
        boolean result = leadRepository.updateById(lead) > 0;

        if (!result) {
            throw new BusinessException("线索更新失败");
        }

        log.info("线索更新成功: id={}", lead.getId());
        return leadRepository.selectById(lead.getId());
    }

    /**
     * 删除线索
     */
    @Override
    @Transactional
    public boolean deleteLead(Long leadId) {
        if (leadId == null || leadId <= 0) {
            throw new BusinessException("线索ID无效");
        }

        Lead lead = leadRepository.selectById(leadId);
        if (lead == null) {
            throw new ResourceNotFoundException("线索不存在");
        }
        if (!dataScopeService.canAccess(lead)) {
            throw new ResourceNotFoundException("线索不存在");
        }

        boolean result = leadRepository.deleteById(leadId) > 0;
        if (result) {
            log.info("线索删除成功: id={}", leadId);
        }

        return result;
    }

    /**
     * 分配线索
     */
    @Override
    @Transactional
    public void assignLead(Long leadId, Long assignTo) {
        if (leadId == null || leadId <= 0) {
            throw new BusinessException("线索ID无效");
        }

        if (assignTo == null || assignTo <= 0) {
            throw new BusinessException("分配人员ID无效");
        }

        Lead lead = leadRepository.selectById(leadId);
        if (lead == null) {
            throw new ResourceNotFoundException("线索不存在");
        }
        if (!dataScopeService.canAccess(lead)) {
            throw new ResourceNotFoundException("线索不存在");
        }

        UserRepository userRepository = userRepositoryProvider.getIfAvailable();
        User assignee = userRepository == null ? null : userRepository.selectById(assignTo);
        if (assignee == null || assignee.getStatus() == null || assignee.getStatus() != 1
                || assignee.getRole() == null
                || !Set.of("sales_director", "sales_manager", "sales").contains(assignee.getRole().toLowerCase())) {
            throw new BusinessException("只能分配给启用中的销售人员");
        }
        DataScopeService.Scope scope = dataScopeService.current();
        if (!scope.isAllScope() && (scope.enterpriseId() == null
                || !scope.enterpriseId().equals(assignee.getEnterpriseId()))) {
            throw new BusinessException("不能将线索分配给其他企业成员");
        }

        lead.setAssignedTo(assignTo);
        lead.setUpdatedAt(LocalDateTime.now());
        leadRepository.updateById(lead);

        log.info("线索已分配: leadId={}, assignTo={}", leadId, assignTo);
    }

    /**
     * 更新线索状态
     */
    @Override
    @Transactional
    public void updateLeadStatus(Long leadId, String status) {
        if (leadId == null || leadId <= 0) {
            throw new BusinessException("线索ID无效");
        }

        if (status == null || status.isEmpty()) {
            throw new BusinessException("线索状态不能为空");
        }

        Lead lead = leadRepository.selectById(leadId);
        if (lead == null) {
            throw new ResourceNotFoundException("线索不存在");
        }
        if (!dataScopeService.canAccess(lead)) {
            throw new ResourceNotFoundException("线索不存在");
        }

        // 检查状态转移是否合法
        validateStatusTransition(lead.getStatus(), status);

        lead.setStatus(status);
        lead.setUpdatedAt(LocalDateTime.now());
        leadRepository.updateById(lead);

        log.info("线索状态更新: leadId={}, status={}", leadId, status);
    }

    /**
     * 线索转客户
     */
    @Override
    @Transactional
    public Customer convertToCustomer(Long leadId, Long convertedBy) {
        return convertToCustomer(leadId, convertedBy, null);
    }

    @Override
    @Transactional
    public Customer convertToCustomer(Long leadId, Long convertedBy, Customer details) {
        if (leadId == null || leadId <= 0) {
            throw new BusinessException("线索ID无效");
        }

        Lead lead = leadRepository.selectById(leadId);
        if (lead == null) {
            throw new ResourceNotFoundException("线索不存在");
        }
        if (!dataScopeService.canAccess(lead)) {
            throw new ResourceNotFoundException("线索不存在");
        }

        // 检查是否已转换
        if (lead.getCustomerId() != null && lead.getCustomerId() > 0) {
            throw new BusinessException("该线索已转换为客户");
        }

        // 创建新客户
        Customer customer = new Customer();
        customer.setName(lead.getTitle());
        customer.setSource(lead.getSource());
        customer.setCreatedBy(convertedBy);
        customer.setAssignedTo(lead.getAssignedTo());
        customer.setEnterpriseId(lead.getEnterpriseId());
        if (details != null) {
            if (details.getName() != null && !details.getName().isBlank()) customer.setName(details.getName());
            if (details.getPhone() != null && !details.getPhone().isBlank()) customer.setPhone(details.getPhone());
            if (details.getCompany() != null && !details.getCompany().isBlank()) customer.setCompany(details.getCompany());
            if (details.getNotes() != null) customer.setNotes(details.getNotes());
        }
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        // 保存客户
        boolean saved = customerRepository.insert(customer) > 0;
        if (!saved) {
            throw new BusinessException("客户创建失败");
        }

        // 更新线索，关联客户
        lead.setCustomerId(customer.getId());
        lead.setStatus("won");
        lead.setClosedAt(LocalDateTime.now());
        lead.setUpdatedAt(LocalDateTime.now());
        leadRepository.updateById(lead);

        log.info("线索转客户成功: leadId={}, customerId={}", leadId, customer.getId());
        return customer;
    }

    /**
     * 批量分配线索
     */
    @Override
    @Transactional
    public void assignLeadsBatch(List<Long> leadIds, Long assignTo) {
        if (leadIds == null || leadIds.isEmpty()) {
            throw new BusinessException("线索ID列表不能为空");
        }

        if (assignTo == null || assignTo <= 0) {
            throw new BusinessException("分配人员ID无效");
        }

        for (Long leadId : leadIds) {
            assignLead(leadId, assignTo);
        }

        log.info("批量分配线索完成: count={}, assignTo={}", leadIds.size(), assignTo);
    }

    /**
     * 获取线索统计信息
     */
    @Override
    public Map<String, Object> getLeadStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 总线索数
        long total = leadRepository.selectCount(null);
        statistics.put("total", total);

        // 按状态统计
        List<String> statuses = Arrays.asList("new", "contacted", "qualified", "proposal", "negotiation", "won",
                "lost");
        Map<String, Long> statusStats = new HashMap<>();
        for (String status : statuses) {
            long count = leadRepository.selectCount(new LambdaQueryWrapper<Lead>().eq(Lead::getStatus, status));
            statusStats.put(status, count);
        }
        statistics.put("byStatus", statusStats);

        // 按优先级统计
        List<String> priorities = Arrays.asList("low", "medium", "high", "urgent");
        Map<String, Long> priorityStats = new HashMap<>();
        for (String priority : priorities) {
            long count = leadRepository.selectCount(new LambdaQueryWrapper<Lead>().eq(Lead::getPriority, priority));
            priorityStats.put(priority, count);
        }
        statistics.put("byPriority", priorityStats);

        // 按来源统计
        // TODO: 实现分组查询获取来源统计

        // 预估总价值
        // TODO: 实现sum查询获取预估总价值

        // 成功转化率
        long wonCount = leadRepository.selectCount(new LambdaQueryWrapper<Lead>().eq(Lead::getStatus, "won"));
        double conversionRate = total > 0 ? (double) wonCount / total * 100 : 0;
        statistics.put("conversionRate", String.format("%.2f%%", conversionRate));

        return statistics;
    }

    /**
     * 获取逾期线索
     */
    @Override
    public List<Lead> getOverdueLeads() {
        LocalDate today = LocalDate.now();
        return leadRepository.selectList(
                new LambdaQueryWrapper<Lead>()
                        .le(Lead::getFollowUpDate, today)
                        .notIn(Lead::getStatus, Arrays.asList("won", "lost")));
    }

    /**
     * 获取高价值线索
     */
    @Override
    public List<Lead> getHighValueLeads(BigDecimal threshold) {
        return leadRepository.selectList(
                new LambdaQueryWrapper<Lead>()
                        .ge(Lead::getEstimatedValue, threshold)
                        .notIn(Lead::getStatus, Arrays.asList("won", "lost"))
                        .orderByDesc(Lead::getEstimatedValue));
    }

    /**
     * 获取用户的线索
     */
    @Override
    public Page<Lead> getLeadsByAssignee(Long userId, int pageNo, int pageSize) {
        if (userId == null || userId <= 0) {
            throw new BusinessException("用户ID无效");
        }

        Page<Lead> page = new Page<>(pageNo, pageSize);
        LambdaQueryWrapper<Lead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Lead::getAssignedTo, userId)
                .orderByDesc(Lead::getCreatedAt);
        return leadRepository.selectPage(page, wrapper);
    }

    /**
     * 验证状态转移是否合法
     */
    private void validateStatusTransition(String currentStatus, String newStatus) {
        // 定义允许的状态转移
        Map<String, List<String>> transitions = new HashMap<>();
        transitions.put("new", Arrays.asList("contacted", "lost"));
        transitions.put("contacted", Arrays.asList("qualified", "lost"));
        transitions.put("qualified", Arrays.asList("proposal", "lost"));
        transitions.put("proposal", Arrays.asList("negotiation", "lost"));
        transitions.put("negotiation", Arrays.asList("won", "lost"));
        transitions.put("won", new ArrayList<>());
        transitions.put("lost", new ArrayList<>());

        List<String> allowedStatuses = transitions.get(currentStatus);
        if (allowedStatuses == null || !allowedStatuses.contains(newStatus)) {
            throw new BusinessException(
                    String.format("不允许从 %s 状态转移到 %s 状态", currentStatus, newStatus));
        }
    }

    @Override
    public void transferLead(Long leadId, Long toUserId, String reason, Long transferredBy) {
        Lead lead = leadRepository.selectById(leadId);
        if (lead == null) {
            throw new ResourceNotFoundException("线索不存在");
        }
        lead.setAssignedTo(toUserId);
        leadRepository.updateById(lead);
    }

    @Override
    public void transferLeadsBatch(List<Long> leadIds, Long toUserId, String reason, Long transferredBy) {
        for (Long leadId : leadIds) {
            transferLead(leadId, toUserId, reason, transferredBy);
        }
    }

    @Override
    public List<LeadTransfer> getLeadTransferHistory(Long leadId) {
        LambdaQueryWrapper<LeadTransfer> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LeadTransfer::getLeadId, leadId);
        wrapper.orderByDesc(LeadTransfer::getCreatedAt);
        return leadTransferRepository.selectList(wrapper);
    }

    @Override
    public LeadTransfer getLastTransfer(Long leadId) {
        List<LeadTransfer> history = getLeadTransferHistory(leadId);
        return history.isEmpty() ? null : history.get(0);
    }
}

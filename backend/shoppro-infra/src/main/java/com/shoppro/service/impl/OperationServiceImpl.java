package com.shoppro.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.shoppro.entity.AutomationRule;
import com.shoppro.entity.Customer;
import com.shoppro.entity.CustomerSop;
import com.shoppro.entity.SopAudit;
import com.shoppro.entity.SopTemplate;
import com.shoppro.entity.WorkTask;
import com.shoppro.repository.AutomationRuleRepository;
import com.shoppro.repository.CustomerRepository;
import com.shoppro.repository.CustomerSopRepository;
import com.shoppro.repository.SopAuditRepository;
import com.shoppro.repository.SopTemplateRepository;
import com.shoppro.repository.WorkTaskRepository;
import com.shoppro.service.OperationService;
import com.shoppro.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OperationServiceImpl implements OperationService {

    private final SopTemplateRepository sopTemplateRepository;
    private final WorkTaskRepository workTaskRepository;
    private final CustomerSopRepository customerSopRepository;
    private final CustomerRepository customerRepository;
    private final SopAuditRepository sopAuditRepository;
    private final AutomationRuleRepository automationRuleRepository;

    public OperationServiceImpl(SopTemplateRepository sopTemplateRepository,
            WorkTaskRepository workTaskRepository,
            CustomerSopRepository customerSopRepository,
            CustomerRepository customerRepository,
            SopAuditRepository sopAuditRepository,
            AutomationRuleRepository automationRuleRepository) {
        this.sopTemplateRepository = sopTemplateRepository;
        this.workTaskRepository = workTaskRepository;
        this.customerSopRepository = customerSopRepository;
        this.customerRepository = customerRepository;
        this.sopAuditRepository = sopAuditRepository;
        this.automationRuleRepository = automationRuleRepository;
    }

    // ===== Automation Rules =====

    @Override
    public List<AutomationRule> listAutomationRules(Long tenantId, String triggerEvent, Boolean isActive) {
        assertTenantAccess(tenantId);
        LambdaQueryWrapper<AutomationRule> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AutomationRule::getTenantId, tenantId);
        if (triggerEvent != null && !triggerEvent.isEmpty()) {
            wrapper.eq(AutomationRule::getTriggerEvent, triggerEvent);
        }
        if (isActive != null) {
            wrapper.eq(AutomationRule::getIsActive, isActive);
        }
        wrapper.orderByDesc(AutomationRule::getPriority);
        wrapper.orderByDesc(AutomationRule::getCreatedAt);
        return automationRuleRepository.selectList(wrapper);
    }

    @Override
    public AutomationRule createAutomationRule(AutomationRule rule) {
        Long tenantId = currentEnterpriseId();
        rule.setTenantId(tenantId);
        assertTenantAccess(tenantId);
        rule.setCreatedAt(LocalDateTime.now());
        rule.setUpdatedAt(LocalDateTime.now());
        rule.setExecutionCount(0);
        automationRuleRepository.insert(rule);
        return rule;
    }

    @Override
    public AutomationRule updateAutomationRule(Long id, AutomationRule rule) {
        AutomationRule existing = automationRuleRepository.selectById(id);
        if (existing == null) {
            throw new RuntimeException("规则不存在");
        }
        assertTenantAccess(existing.getTenantId());
        rule.setId(id);
        rule.setTenantId(existing.getTenantId());
        rule.setUpdatedAt(LocalDateTime.now());
        automationRuleRepository.updateById(rule);
        return rule;
    }

    @Override
    public void deleteAutomationRule(Long id) {
        AutomationRule existing = automationRuleRepository.selectById(id);
        if (existing == null) throw new RuntimeException("规则不存在");
        assertTenantAccess(existing.getTenantId());
        automationRuleRepository.deleteById(id);
    }

    @Override
    public AutomationRule toggleAutomationRule(Long id) {
        AutomationRule rule = automationRuleRepository.selectById(id);
        if (rule == null) {
            throw new RuntimeException("规则不存在");
        }
        assertTenantAccess(rule.getTenantId());
        rule.setIsActive(!rule.getIsActive());
        rule.setUpdatedAt(LocalDateTime.now());
        automationRuleRepository.updateById(rule);
        return rule;
    }

    // ===== SOP Templates =====

    @Override
    public List<SopTemplate> listSopTemplates(Long tenantId) {
        assertTenantAccess(tenantId);
        LambdaQueryWrapper<SopTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SopTemplate::getEnterpriseId, tenantId);
        return sopTemplateRepository.selectList(wrapper);
    }

    @Override
    @Transactional
    public SopTemplate createSopTemplate(SopTemplate sopTemplate) {
        if (sopTemplate.getEnterpriseId() == null) {
            Long enterpriseId = currentEnterpriseId();
            sopTemplate.setEnterpriseId(enterpriseId);
        }
        assertTenantAccess(sopTemplate.getEnterpriseId());
        sopTemplate.setCreatedAt(LocalDateTime.now());
        sopTemplateRepository.insert(sopTemplate);
        return sopTemplate;
    }

    @Override
    public SopTemplate updateSopTemplate(Long id, SopTemplate sopTemplate) {
        SopTemplate existing = sopTemplateRepository.selectById(id);
        if (existing == null) throw new RuntimeException("SOP不存在");
        assertTenantAccess(existing.getEnterpriseId());
        sopTemplate.setId(id);
        sopTemplate.setEnterpriseId(existing.getEnterpriseId());
        sopTemplateRepository.updateById(sopTemplate);
        return sopTemplateRepository.selectById(id);
    }

    @Override
    public void deleteSopTemplate(Long id) {
        SopTemplate existing = sopTemplateRepository.selectById(id);
        if (existing == null) throw new RuntimeException("SOP不存在");
        assertTenantAccess(existing.getEnterpriseId());
        sopTemplateRepository.deleteById(id);
    }

    @Override
    public List<WorkTask> listWorkTasks(Long userId, String status) {
        if (userId == null) throw new IllegalArgumentException("任务负责人不能为空");
        if (!isPlatformRole() && userId != null && SecurityUtils.getUserId() != null
                && isSelfRole() && !userId.equals(SecurityUtils.getUserId())) {
            throw new SecurityException("无权查看其他用户任务");
        }
        LambdaQueryWrapper<WorkTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkTask::getUserId, userId);
        if (status != null) {
            wrapper.eq(WorkTask::getStatus, status);
        }
        wrapper.orderByAsc(WorkTask::getDueTime);
        return workTaskRepository.selectList(wrapper);
    }

    @Override
    @Transactional
    public WorkTask createWorkTask(WorkTask workTask) {
        workTask.setEnterpriseId(currentEnterpriseId());
        workTask.setCreatedAt(LocalDateTime.now());
        workTask.setStatus("pending");
        workTaskRepository.insert(workTask);
        return workTask;
    }

    @Override
    @Transactional
    public void completeWorkTask(Long id) {
        WorkTask task = workTaskRepository.selectById(id);
        if (task != null) {
            assertTenantAccess(task.getEnterpriseId());
            if (isSelfRole() && !SecurityUtils.getUserId().equals(task.getUserId())) {
                throw new SecurityException("无权完成其他用户任务");
            }
            task.setStatus("completed");
            task.setUpdatedAt(LocalDateTime.now());
            workTaskRepository.updateById(task);
        }
    }

    @Override
    @Transactional
    public void applySopToCustomer(Long customerId, Long sopTemplateId) {
        SopTemplate sop = sopTemplateRepository.selectById(sopTemplateId);
        if (sop == null)
            return;
        assertTenantAccess(sop.getEnterpriseId());

        Customer customer = customerRepository.selectById(customerId);
        if (customer == null) throw new RuntimeException("客户不存在");
        assertTenantAccess(customer.getEnterpriseId());
        CustomerSop customerSop = new CustomerSop();
        customerSop.setCustomerId(customerId);
        customerSop.setSopTemplateId(sopTemplateId);
        customerSop.setStatus("active");
        customerSop.setCurrentStep(1);
        customerSop.setCreatedAt(LocalDateTime.now());
        customerSop.setUpdatedAt(LocalDateTime.now());
        customerSopRepository.insert(customerSop);

        Long assignedUserId = getAssignedUserId(customerId);

        WorkTask task = new WorkTask();
        task.setCustomerId(customerId);
        task.setCustomerSopId(customerSop.getId());
        task.setUserId(assignedUserId);
        task.setTitle("SOP: " + sop.getName() + " - 第1阶段");
        task.setDescription("根据SOP模板执行第1阶段工作");
        task.setType("sop");
        task.setStatus("pending");
        task.setDueTime(LocalDateTime.now().plusDays(1));
        this.createWorkTask(task);
    }

    private Long getAssignedUserId(Long customerId) {
        Customer customer = customerRepository.selectById(customerId);
        if (customer != null && customer.getAssignedTo() != null) {
            return customer.getAssignedTo();
        }
        Long currentUserId = SecurityUtils.getUserId();
        if (currentUserId != null) {
            return currentUserId;
        }
        throw new RuntimeException("无法确定任务分配人：客户无负责人且当前用户未登录");
    }

    @Override
    public String exportSopAudit(Long tenantId) {
        assertTenantAccess(tenantId);
        LambdaQueryWrapper<WorkTask> wrapper = new LambdaQueryWrapper<>();
        // In WorkTask, it should have a tenantId/enterpriseId or we find it via user
        // Assuming WorkTask has tenant_id (enterprise_id) based on the requirement of
        // multi-tenancy
        // If not, we might need to join with users table.
        // Let's check WorkTask entity if possible.
        // For now, assume it has enterpriseId.
        wrapper.eq(WorkTask::getEnterpriseId, tenantId);
        List<WorkTask> tasks = workTaskRepository.selectList(wrapper);
        StringBuilder csv = new StringBuilder("任务ID,客户ID,任务标题,任务类型,执行状态,截止时间,创建时间\n");
        for (WorkTask task : tasks) {
            csv.append(task.getId()).append(",")
                    .append(task.getCustomerId()).append(",")
                    .append(task.getTitle() != null ? task.getTitle().replace(",", " ") : "").append(",")
                    .append(task.getType()).append(",")
                    .append(task.getStatus()).append(",")
                    .append(task.getDueTime()).append(",")
                    .append(task.getCreatedAt()).append("\n");
        }
        return csv.toString();
    }

    @Override
    public List<SopAudit> listSopAudits(Long tenantId, String status, String ruleName, int page, int size) {
        assertTenantAccess(tenantId);
        LambdaQueryWrapper<SopAudit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SopAudit::getTenantId, tenantId);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(SopAudit::getStatus, status);
        }
        if (ruleName != null && !ruleName.isEmpty()) {
            wrapper.like(SopAudit::getRuleName, ruleName);
        }
        wrapper.orderByDesc(SopAudit::getExecutedAt);
        Page<SopAudit> pageObj = new Page<>(page, size);
        IPage<SopAudit> result = sopAuditRepository.selectPage(pageObj, wrapper);
        return result.getRecords();
    }

    @Override
    public long countSopAudits(Long tenantId, String status, String ruleName) {
        assertTenantAccess(tenantId);
        LambdaQueryWrapper<SopAudit> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SopAudit::getTenantId, tenantId);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(SopAudit::getStatus, status);
        }
        if (ruleName != null && !ruleName.isEmpty()) {
            wrapper.like(SopAudit::getRuleName, ruleName);
        }
        return sopAuditRepository.selectCount(wrapper);
    }

    private Long currentEnterpriseId() {
        if (SecurityUtils.getLoginUser() == null || SecurityUtils.getLoginUser().getUser() == null
                || SecurityUtils.getLoginUser().getUser().getEnterpriseId() == null) {
            throw new SecurityException("当前用户未绑定企业");
        }
        return SecurityUtils.getLoginUser().getUser().getEnterpriseId();
    }

    private boolean isPlatformRole() {
        return SecurityUtils.getAuthentication() != null && SecurityUtils.getAuthentication().getAuthorities().stream()
                .anyMatch(a -> java.util.Set.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN", "ROLE_PLATFORM_ADMIN").contains(a.getAuthority()));
    }

    private boolean isSelfRole() {
        String role = SecurityUtils.getLoginUser() != null && SecurityUtils.getLoginUser().getUser() != null
                ? SecurityUtils.getLoginUser().getUser().getRole() : null;
        return role != null && java.util.Set.of("sales", "user").contains(role.toLowerCase());
    }

    private void assertTenantAccess(Long tenantId) {
        if (tenantId == null) throw new SecurityException("企业不能为空");
        if (isPlatformRole()) return;
        if (!tenantId.equals(currentEnterpriseId())) {
            throw new SecurityException("无权访问其他企业数据");
        }
    }
}

package com.shoppro.service;

import com.shoppro.entity.AutomationRule;
import com.shoppro.entity.SopAudit;
import com.shoppro.entity.SopTemplate;
import com.shoppro.entity.WorkTask;
import java.util.List;

/**
 * <p>
 * Operation Service Interface
 * </p>
 *
 * @author shoppro
 * @since 2023-12-22
 */
public interface OperationService {

    // Automation Rules
    List<AutomationRule> listAutomationRules(Long tenantId, String triggerEvent, Boolean isActive);

    AutomationRule createAutomationRule(AutomationRule rule);

    AutomationRule updateAutomationRule(Long id, AutomationRule rule);

    void deleteAutomationRule(Long id);

    AutomationRule toggleAutomationRule(Long id);

    // SOP Templates
    List<SopTemplate> listSopTemplates(Long tenantId);

    SopTemplate createSopTemplate(SopTemplate sopTemplate);

    SopTemplate updateSopTemplate(Long id, SopTemplate sopTemplate);

    void deleteSopTemplate(Long id);

    // Work Tasks
    List<WorkTask> listWorkTasks(Long userId, String status);

    WorkTask createWorkTask(WorkTask workTask);

    void completeWorkTask(Long id);

    void applySopToCustomer(Long customerId, Long sopTemplateId); // Generate tasks from SOP

    // Sop Audits
    List<SopAudit> listSopAudits(Long tenantId, String status, String ruleName, int page, int size);

    long countSopAudits(Long tenantId, String status, String ruleName);

    String exportSopAudit(Long tenantId);
}

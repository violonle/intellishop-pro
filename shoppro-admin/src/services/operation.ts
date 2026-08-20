import request from '@/utils/request';

export const getSopTemplates = (tenantId?: number) => {
    return request({
        url: '/operation/sop',
        method: 'get',
        params: { tenantId }
    });
};

export const createSopTemplate = (data: any) => {
    return request({
        url: '/operation/sop',
        method: 'post',
        data
    });
};

export const deleteSopTemplate = (id: number) => {
    return request({
        url: `/operation/sop/${id}`,
        method: 'delete'
    });
};

export const exportSopAudit = (tenantId?: number) => {
    return request({
        url: '/operation/sop/export',
        method: 'get',
        params: { tenantId },
        responseType: 'blob'
    });
};

export interface SopAuditQueryParams {
    tenantId?: number;
    status?: string;
    ruleName?: string;
    page?: number;
    size?: number;
}

export interface SopAuditRecord {
    id: number;
    tenantId: number;
    sopTemplateId: number;
    ruleName: string;
    triggerEvent: string;
    targetType: string;
    targetName: string;
    targetId: number;
    status: 'success' | 'failed' | 'pending' | 'running';
    errorMessage: string | null;
    executedAt: string;
    duration: number;
    createdAt: string;
}

export interface SopAuditResponse {
    records: SopAuditRecord[];
    total: number;
    page: number;
    size: number;
}

export const getSopAudits = (params: SopAuditQueryParams) => {
    return request({
        url: '/operation/sop/audit/list',
        method: 'get',
        params
    });
};

export interface AutomationRule {
    id?: number;
    tenantId?: number;
    name: string;
    description?: string;
    triggerEvent: string;
    conditions?: string;
    actions?: string;
    isActive: boolean;
    executionCount?: number;
    lastExecutedAt?: string;
    priority?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface AutomationRuleParams {
    tenantId?: number;
    triggerEvent?: string;
    isActive?: boolean;
}

export const getAutomationRules = (params?: AutomationRuleParams) => {
    return request({
        url: '/operation/automation-rule',
        method: 'get',
        params
    });
};

export const createAutomationRule = (data: Partial<AutomationRule>) => {
    return request({
        url: '/operation/automation-rule',
        method: 'post',
        data
    });
};

export const updateAutomationRule = (id: number, data: Partial<AutomationRule>) => {
    return request({
        url: `/operation/automation-rule/${id}`,
        method: 'put',
        data
    });
};

export const deleteAutomationRule = (id: number) => {
    return request({
        url: `/operation/automation-rule/${id}`,
        method: 'delete'
    });
};

export const toggleAutomationRule = (id: number) => {
    return request({
        url: `/operation/automation-rule/${id}/toggle`,
        method: 'put'
    });
};

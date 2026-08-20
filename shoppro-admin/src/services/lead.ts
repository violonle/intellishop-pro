import request from '@/utils/request';

export interface LeadQueryDTO {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
    priority?: string;
    source?: string;
}

export interface LeadDTO {
    id?: number;
    title: string;
    source?: string;
    status?: string;
    priority?: string;
    estimatedValue?: number;
    budgetRange?: string;
    successProbability?: number;
    description?: string;
    ownerId?: number;
    customerId?: number;
    interestedProducts?: string[];
}

export const leadService = {
    getLeads: (params?: LeadQueryDTO) => {
        return request({
            url: params?.keyword ? '/leads/search' : '/leads/list',
            method: 'get',
            params: {
                pageNo: params?.pageNo || 1,
                pageSize: params?.pageSize || 20,
                keyword: params?.keyword,
                status: params?.status,
                source: params?.source
            }
        });
    },

    getLeadDetail: (id: number | string) => {
        return request({
            url: `/leads/${id}`,
            method: 'get'
        });
    },

    createLead: (data: LeadDTO) => {
        return request({
            url: '/leads',
            method: 'post',
            data
        });
    },

    updateLead: (id: number | string, data: Partial<LeadDTO>) => {
        return request({
            url: `/leads/${id}`,
            method: 'put',
            data
        });
    },

    updateStatus: (id: number | string, status: string) => {
        return request({
            url: `/leads/${id}/status`,
            method: 'post',
            params: { status }
        });
    },

    assignLead: (id: number | string, userId: number) => {
        return request({
            url: `/leads/${id}/assign`,
            method: 'post',
            params: { assignTo: userId }
        });
    },

    deleteLead: (id: number | string) => {
        return request({
            url: `/leads/${id}`,
            method: 'delete'
        });
    },

    getStatistics: () => {
        return request({
            url: '/leads/statistics',
            method: 'get'
        });
    }
};

export default leadService;

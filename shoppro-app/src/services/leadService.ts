import { http } from './http';

export interface Lead {
    id: number;
    customerId?: number;
    title: string;
    description?: string;
    source: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
    stage?: string;
    estimatedValue?: number;
    successProbability?: number; // 0-100
    interestedProducts?: string[];
    budgetRange?: string;
    decisionTimeline?: string;
    competitorInfo?: string;
    assignedTo?: number;
    ownerName?: string; // Derived or joined backend
    followUpDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LeadStatistics {
    total: number;
    newLeads: number;
    converted: number;
    conversionRate: number;
    // Add other stats as returned by backend
    [key: string]: any;
}

export const leadService = {
    getLeads: async (params: {
        pageNo?: number;
        pageSize?: number;
        status?: string;
        priority?: string;
        source?: string;
        assignedTo?: number;
    }) => {
        const response = await http.get<any>('/leads/list', { params });
        return {
            items: response.records || [],
            total: response.total,
            current: response.current,
            size: response.size
        };
    },

    searchLeads: async (keyword: string, pageNo = 1, pageSize = 10) => {
        const response = await http.get<any>('/leads/search', {
            params: { keyword, pageNo, pageSize }
        });
        return {
            items: response.records || [],
            total: response.total
        };
    },

    getLeadDetail: async (id: number) => {
        return await http.get<Lead>(`/leads/${id}`);
    },

    createLead: async (data: Partial<Lead>) => {
        return await http.post<Lead>('/leads', data);
    },

    updateLead: async (data: Partial<Lead>) => {
        const { id, ...rest } = data;
        return await http.put<Lead>(`/leads/${id}`, rest);
    },

    deleteLead: async (id: number) => {
        return await http.delete(`/leads/${id}`);
    },

    getStatistics: async () => {
        return await http.get<LeadStatistics>('/leads/statistics');
    },

    updateStatus: async (id: number, status: string) => {
        return await http.post(`/leads/${id}/status`, null, { params: { status } });
    },

    convertToCustomer: async (id: number, details?: { name?: string; phone?: string; company?: string; notes?: string }) => {
        return await http.post('/leads/' + id + '/convert', details || {});
    }
};

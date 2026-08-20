import { http } from './http';

export interface FollowUpRecord {
    id: number;
    leadId?: number;
    customerId?: number;
    title: string;
    content: string;
    type: string;
    result?: string;
    nextFollowUpDate?: string;
    duration?: number;
    createdAt?: string;
}

export const followUpService = {
    listByLead: (leadId: number) => http.get<FollowUpRecord[]>(`/follow-ups/lead/${leadId}`),
    listByCustomer: (customerId: number) => http.get<FollowUpRecord[]>(`/follow-ups/customer/${customerId}`),
    create: (data: Pick<FollowUpRecord, 'title' | 'content' | 'type'> & Partial<FollowUpRecord>) =>
        http.post<FollowUpRecord>('/follow-ups', data)
};

export default followUpService;

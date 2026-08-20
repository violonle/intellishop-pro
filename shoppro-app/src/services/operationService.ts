import { http } from './http';

export interface SopTemplate {
    id: number;
    name: string;
    description?: string;
    steps: string; // JSON string
    createdAt?: string;
}

export interface WorkTask {
    id: number;
    userId: number;
    customerId?: number;
    type: 'sop' | 'manual' | 'ai_suggestion';
    title: string;
    description?: string;
    status: 'pending' | 'completed' | 'cancelled';
    dueTime?: string;
    createdAt?: string;
}

export const operationService = {
    // SOP Templates
    listSopTemplates: () => {
        return http.get<SopTemplate[]>('/operation/sop');
    },
    createSopTemplate: (data: Partial<SopTemplate>) => {
        return http.post<SopTemplate>('/operation/sop', data);
    },
    deleteSopTemplate: (id: number) => {
        return http.delete(`/operation/sop/${id}`);
    },
    applySopToCustomer: (customerId: number, sopTemplateId: number) => {
        return http.post('/operation/sop/apply', null, { params: { customerId, sopTemplateId } });
    },

    // Work Tasks
    listWorkTasks: (userId: number, status?: string) => {
        return http.get<WorkTask[]>('/operation/tasks', { params: { userId, status } });
    },
    createWorkTask: (data: Partial<WorkTask>) => {
        return http.post<WorkTask>('/operation/tasks', data);
    },
    completeWorkTask: (id: number) => {
        return http.put(`/operation/tasks/${id}/complete`);
    }
};

export default operationService;

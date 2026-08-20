import { http } from './http';

export interface MarketingTask {
    id?: number;
    name: string;
    type: 'email' | 'sms' | 'notification';
    status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
    targetAudience?: string; // JSON string or description
    content?: string;
    scheduleTime?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const marketingService = {
    /**
     * Create a new marketing task
     */
    createTask: (task: MarketingTask) => {
        return http.post<MarketingTask>('/marketing/tasks', task);
    },

    /**
     * Start task scheduling
     */
    startTask: (id: number) => {
        return http.post<void>(`/marketing/tasks/${id}/start`);
    },

    /**
     * Stop task scheduling
     */
    stopTask: (id: number) => {
        return http.post<void>(`/marketing/tasks/${id}/stop`);
    },

    /**
     * Page query marketing tasks
     */
    getTasks: (params: { pageNo?: number; pageSize?: number; name?: string }) => {
        return http.get<{ records: MarketingTask[]; total: number; current: number }>('/marketing/tasks', { params });
    },

    /**
     * Get task execution summary
     */
    getTaskSummary: (id: number) => {
        return http.get<MarketingTask>(`/marketing/tasks/${id}/summary`);
    }
};

export default marketingService;

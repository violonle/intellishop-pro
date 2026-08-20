import { http } from './http';

export interface ChannelCode {
    id: number;
    userId: number;
    channelType?: string;
    channelName: string;
    codeUrl?: string;
    description?: string;
    scanCount: number;
    followCount: number;
    createdAt?: string;
}

export interface WelcomeMessage {
    id?: number;
    channelCodeId: number;
    msgType: 'text' | 'image' | 'link' | 'miniprogram';
    content: string;
    createdAt?: string;
}

export interface FissionTask {
    id: number;
    name: string;
    type: 'poster' | 'lottery' | 'task_bot';
    config: string;
    status: number;
    createdAt?: string;
}

export const acquisitionService = {
    // Channel Codes
    listChannelCodes: (userId: number) => {
        return http.get<ChannelCode[]>('/acquisition/channels', { params: { userId } });
    },
    createChannelCode: (data: Partial<ChannelCode>) => {
        return http.post<ChannelCode>('/acquisition/channels', data);
    },
    deleteChannelCode: (id: number) => {
        return http.delete(`/acquisition/channels/${id}`);
    },
    getChannelByType: (userId: number, type: string) => {
        return http.get<ChannelCode>('/acquisition/channels/type', { params: { userId, type } });
    },

    // Welcome Messages
    getWelcomeMessage: (channelCodeId: number) => {
        return http.get<WelcomeMessage>(`/acquisition/welcome/${channelCodeId}`);
    },
    saveWelcomeMessage: (data: WelcomeMessage) => {
        return http.post<WelcomeMessage>('/acquisition/welcome', data);
    },

    // Fission Tasks
    listFissionTasks: () => {
        return http.get<FissionTask[]>('/acquisition/fission');
    },
    createFissionTask: (data: Partial<FissionTask>) => {
        return http.post<FissionTask>('/acquisition/fission', data);
    },
    toggleFissionTaskStatus: (id: number) => {
        return http.put(`/acquisition/fission/${id}/status`);
    }
};

export default acquisitionService;

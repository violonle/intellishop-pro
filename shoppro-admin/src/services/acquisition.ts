import request from '@/utils/request';

export const getGlobalAcquisitionStats = (tenantId?: number) => {
    return request({
        url: '/acquisition/stats/global',
        method: 'get',
        params: { tenantId }
    });
};

export const getChannelDistribution = (tenantId?: number) => {
    return request({
        url: '/acquisition/stats/channels',
        method: 'get',
        params: { tenantId }
    });
};

export const getSalesRanking = (tenantId?: number) => {
    return request({
        url: '/acquisition/stats/sales',
        method: 'get',
        params: { tenantId }
    });
};

export const exportChannelStats = (tenantId?: number) => {
    return request({
        url: '/acquisition/channels/export',
        method: 'get',
        params: { tenantId },
        responseType: 'blob'
    });
};

export interface WelcomeMessage {
    id?: number;
    tenantId?: number;
    channelCodeId: number;
    channelCodeName?: string;
    msgType?: string;
    content: string;
    isActive?: boolean;
    priority?: number;
    createdAt?: string;
    updatedAt?: string;
}

export const getWelcomeMessages = (tenantId?: number) => {
    return request({
        url: '/acquisition/welcome-message/list',
        method: 'get',
        params: { tenantId }
    });
};

export const saveWelcomeMessage = (data: Partial<WelcomeMessage>) => {
    return request({
        url: '/acquisition/welcome',
        method: 'post',
        data
    });
};

export const deleteWelcomeMessage = (id: number) => {
    return request({
        url: `/acquisition/welcome/${id}`,
        method: 'delete'
    });
};

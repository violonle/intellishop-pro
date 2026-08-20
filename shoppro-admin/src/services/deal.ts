import request from '@/utils/request';

export interface DealQueryDTO {
    pageNo?: number;
    pageSize?: number;
    stage?: string;
    keyword?: string;
}

export const dealService = {
    getDeals: (params?: DealQueryDTO) => {
        return request({
            url: '/orders',
            method: 'get',
            params: {
                page: (params?.pageNo || 1) - 1,
                size: params?.pageSize || 20,
                status: params?.stage
            }
        });
    },

    getDealDetail: (id: number | string) => {
        return request({
            url: `/orders/${id}`,
            method: 'get'
        });
    },

    createDeal: (data: any) => {
        return request({
            url: '/orders',
            method: 'post',
            data
        });
    },

    updateDealStage: (id: number | string, status: number | string) => {
        return request({
            url: `/orders/${id}/status`,
            method: 'put',
            params: { status }
        });
    }
};

export default dealService;

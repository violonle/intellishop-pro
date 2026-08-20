import request from '@/utils/request';

export interface CustomerQueryDTO {
    pageNo?: number;
    pageSize?: number;
    keyword?: string;
    level?: string;
    status?: string;
    industry?: string;
}

export interface CustomerDTO {
    id?: number;
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    level?: 'vip' | 'high' | 'medium' | 'low';
    status?: 'active' | 'inactive';
    industry?: string;
    tags?: string[];
    ownerId?: number;
    remark?: string;
}

export const customerService = {
    getCustomers: (params?: CustomerQueryDTO) => {
        return request({
            url: '/customers/list',
            method: 'get',
            params: {
                pageNo: params?.pageNo || 1,
                pageSize: params?.pageSize || 20,
                keyword: params?.keyword,
                level: params?.level,
                status: params?.status
            }
        });
    },

    getCustomerDetail: (id: number | string) => {
        return request({
            url: `/customers/${id}`,
            method: 'get'
        });
    },

    createCustomer: (data: CustomerDTO) => {
        return request({
            url: '/customers',
            method: 'post',
            data
        });
    },

    updateCustomer: (id: number | string, data: Partial<CustomerDTO>) => {
        return request({
            url: `/customers/${id}`,
            method: 'put',
            data
        });
    },

    deleteCustomer: (id: number | string) => {
        return request({
            url: `/customers/${id}`,
            method: 'delete'
        });
    },

    getStatistics: () => {
        return request({
            url: '/customers/statistics',
            method: 'get'
        });
    }
};

export default customerService;

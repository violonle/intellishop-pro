import request from '@/utils/request';

export const getTenantPage = (params: any) => {
    return request({
        url: '/tenants/page',
        method: 'get',
        params,
    });
};

export const createTenant = (data: any) => {
    return request({
        url: '/tenants',
        method: 'post',
        data,
    });
};

export const updateTenant = (id: string, data: any) => {
    return request({
        url: `/tenants/${id}`,
        method: 'put',
        data,
    });
};

export const getTenantDetail = (id: string) => {
    return request({
        url: `/tenants/${id}`,
        method: 'get',
    });
};

export const getEnterpriseMembers = (id: string | number) => {
    return request({
        url: `/enterprise/${id}/members`,
        method: 'get',
    });
};

export const removeEnterpriseMember = (enterpriseId: string | number, userId: string | number) => {
    return request({
        url: `/enterprise/${enterpriseId}/members/${userId}`,
        method: 'delete',
    });
};

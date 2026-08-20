import request from '@/utils/request';

export interface Enterprise {
    id?: number;
    name: string;
    code?: string;
    contactPerson?: string;
    contactPhone?: string;
    email?: string;
    address?: string;
    industry?: string;
    scale?: string;
    status?: number;
    remark?: string;
    employeeCount?: number;
    productCount?: number;
    customerCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

// 获取当前登录企业信息
export const getCurrentEnterprise = () => {
    return request({
        url: '/enterprise/current',
        method: 'get',
    });
};

// 更新当前企业信息
export const updateCurrentEnterprise = (data: any) => {
    return request({
        url: '/enterprise/current',
        method: 'put',
        data,
    });
};

// 提交企业认证信息
export const submitCertification = (data: any) => {
    return request({
        url: '/enterprise/certification',
        method: 'post',
        data,
    });
};

// 查询企业认证状态
export const getCertificationStatus = (id: number) => {
    return request({
        url: `/enterprise/certification/${id}`,
        method: 'get',
    });
};

// 企业成员管理
export const getEnterpriseMembers = (enterpriseId: number) => {
    return request({
        url: `/enterprise/${enterpriseId}/members`,
        method: 'get',
    });
};

export const addEnterpriseMember = (enterpriseId: number, data: any) => {
    return request({
        url: `/enterprise/${enterpriseId}/members`,
        method: 'post',
        data,
    });
};

export const removeEnterpriseMember = (enterpriseId: number, userId: number) => {
    return request({
        url: `/enterprise/${enterpriseId}/members/${userId}`,
        method: 'delete',
    });
};

// 平台超管：企业/租户列表管理
export const getEnterprisePage = (params: any) => {
    return request({
        url: '/tenants/page',
        method: 'get',
        params,
    });
};

export const getEnterpriseById = (id: number) => {
    return request({
        url: `/tenants/${id}`,
        method: 'get',
    });
};

export const createEnterprise = (data: any) => {
    return request({
        url: '/tenants',
        method: 'post',
        data,
    });
};

export const updateEnterprise = (id: number, data: any) => {
    return request({
        url: `/tenants/${id}`,
        method: 'put',
        data,
    });
};

export const deleteEnterprise = (id: number) => {
    return request({
        url: `/tenants/${id}`,
        method: 'delete',
    });
};

export default {
    getCurrentEnterprise,
    updateCurrentEnterprise,
    submitCertification,
    getCertificationStatus,
    getEnterpriseMembers,
    addEnterpriseMember,
    removeEnterpriseMember,
    getEnterprisePage,
    getEnterpriseById,
    createEnterprise,
    updateEnterprise,
    deleteEnterprise,
};

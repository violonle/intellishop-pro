import request from '@/utils/request';

export const getAllEnabledPermissions = () => {
    return request({
        url: '/permissions/enabled',
        method: 'get',
    });
};

export const getRolePermissions = (roleId: number) => {
    return request({
        url: `/permissions/role/${roleId}`,
        method: 'get',
    });
};

export const getPermissionsPage = (params: any) => {
    return request({
        url: '/permissions/page',
        method: 'get',
        params,
    });
};

import request from '@/utils/request';

export const getAllRoles = () => {
    return request({
        url: '/roles',
        method: 'get',
    });
};

export const assignPermissionsToRole = (roleId: number, permissionIds: number[]) => {
    return request({
        url: `/roles/${roleId}/permissions`,
        method: 'post',
        data: permissionIds,
    });
};

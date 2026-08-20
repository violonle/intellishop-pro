import request from '@/utils/request';

export const getUserPage = (params: any) => {
    return request({
        url: '/users/list',
        method: 'get',
        params,
    });
};

export const getUserDetail = (id: number) => {
    return request({
        url: `/users/${id}`,
        method: 'get',
    });
};

export const updateUserInfo = (id: number, data: any) => {
    return request({
        url: `/users/${id}`,
        method: 'put',
        data,
    });
};

export const deleteUser = (id: number) => {
    return request({
        url: `/users/${id}`,
        method: 'delete',
    });
};

export const toggleUserStatus = (id: number) => {
    return request({
        url: `/users/${id}/status`,
        method: 'put',
    });
};

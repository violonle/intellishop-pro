import request from '@/utils/request';

export const getDepartmentTree = (params?: any) => {
    return request({
        url: '/departments/tree',
        method: 'get',
        params,
    });
};

export const getDepartmentMembers = (deptId: string | number) => {
    return request({
        url: '/users/list',
        method: 'get',
        params: { departmentId: deptId },
    });
};

export default {
    getDepartmentTree,
    getDepartmentMembers,
};

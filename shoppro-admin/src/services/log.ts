import request from '@/utils/request';

export const getLogPage = (params: any) => {
    return request({
        url: '/logs/page',
        method: 'get',
        params,
    });
};

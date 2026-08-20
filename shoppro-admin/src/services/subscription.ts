import request from '@/utils/request';

export const getSubscriptionPlans = () => {
    return request({
        url: '/subscriptions/plans',
        method: 'get',
    });
};

export const getSubscriptionPlan = (id: number) => {
    return request({
        url: `/subscriptions/plans/${id}`,
        method: 'get',
    });
};

export const updateSubscriptionPlan = (id: number, data: any) => {
    return request({
        url: `/subscriptions/plans/${id}`,
        method: 'put',
        data,
    });
};

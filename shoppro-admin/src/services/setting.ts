import request from '@/utils/request';

export interface SystemSetting {
    settingKey: string;
    settingValue: string;
    description?: string;
    type?: string;
}

export const getSettings = () => {
    return request({
        url: '/settings',
        method: 'get',
    });
};

export const getSettingsByType = (type: string) => {
    return request({
        url: `/settings/type/${type}`,
        method: 'get',
    });
};

export const getSettingByKey = (key: string) => {
    return request({
        url: `/settings/${key}`,
        method: 'get',
    });
};

export const saveSetting = (data: SystemSetting) => {
    return request({
        url: '/settings',
        method: 'post',
        data,
    });
};

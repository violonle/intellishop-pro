import axios from 'axios';
import { getToken } from './storage';
import { LOGIN_PATH } from '@/site';

const service = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

service.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers['Authorization'] = `Bearer ${token.trim()}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response) => {
        const res = response.data;
        if (res && typeof res === 'object' && res.code !== undefined && res.code !== 200 && res.code !== 0) {
            return Promise.reject(new Error(res.message || '业务请求失败'));
        }
        return res.data !== undefined ? res.data : res;
    },
    (error) => {
        const rawMsg = error.response?.data?.message || error.message || '网络请求异常';
        if (error.response) {
            console.warn(`[Admin Request ${error.response.status}] URL:`, error.response.config.url);
            if (error.response.status === 401 && !error.response.config.url?.includes('/auth/')) {
                localStorage.removeItem('shoppro_admin_token');
                localStorage.removeItem('shoppro_admin_user');
                if (window.location.pathname !== LOGIN_PATH) {
                    window.location.assign(LOGIN_PATH);
                }
            }
        }
        return Promise.reject(new Error(rawMsg));
    }
);

export default service;

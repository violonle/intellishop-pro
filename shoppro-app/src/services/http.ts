import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 定义 API 响应结构
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

const config: AxiosRequestConfig = {
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
};

class HttpClient {
    private instance: AxiosInstance;

    constructor(config: AxiosRequestConfig) {
        this.instance = axios.create(config);

        // 请求拦截器
        this.instance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
                if (token && token !== 'undefined' && token !== 'null' && config.headers) {
                    config.headers.Authorization = `Bearer ${token.trim()}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.instance.interceptors.response.use(
            (response: AxiosResponse) => {
                const res = response.data;
                // 如果后端返回 code 且不为 200/0 时视为业务错误
                if (res && typeof res === 'object' && res.code !== undefined && res.code !== 200 && res.code !== 0) {
                    return Promise.reject(new Error(res.message || '业务请求失败'));
                }
                return res.data !== undefined ? res.data : res;
            },
            (error: AxiosError) => {
                const { response } = error;
                if (response) {
                    console.warn(`[HTTP ${response.status}] 请求未完成:`, response.config.url);
                    if (response.status === 401 && !response.config.url?.includes('/auth/')) {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        if (window.location.pathname !== '/login') window.location.assign('/login');
                    }
                }
                const message = (response?.data as any)?.message || error.message || '请求失败';
                return Promise.reject(new Error(message));
            }
        );
    }

    public request<T = any>(config: AxiosRequestConfig): Promise<T> {
        return this.instance.request(config);
    }

    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.get(url, config);
    }

    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.post(url, data, config);
    }

    public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.put(url, data, config);
    }

    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return this.instance.delete(url, config);
    }
}

export const http = new HttpClient(config);

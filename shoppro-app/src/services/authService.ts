import { http } from './http';

export interface User {
    id: number;
    username: string;
    realName?: string;
    avatarUrl?: string;
    role: string; // 'admin' | 'manager' | 'sales' | 'user'
    departmentId?: number;
    phone?: string;
    email?: string;
    salesTargets?: string | Record<string, any>; // JSON string or object
    status?: number;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number;
    userId: number;
    username: string;
    phone?: string;
    email?: string;
    realName?: string;
    avatarUrl?: string;
    role: string;
}

export interface RegisterDTO {
    username: string;
    password: string;
    realName?: string;
    phone?: string;
    email?: string;
}

export const authService = {
    /**
     * 用户登录
     */
    login: (credentials: any) => {
        return http.post<LoginResponse>('/auth/login', credentials);
    },

    /**
     * 用户注册
     */
    register: (data: RegisterDTO) => {
        return http.post<User>('/auth/register', data);
    },

    /**
     * 退出登录
     */
    logout: () => {
        return http.post('/auth/logout').finally(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        });
    },

    /**
     * 获取当前用户信息
     */
    getCurrentUser: () => {
        return http.get<User>('/users/profile');
    },

    /**
     * 更新用户信息
     */
    updateProfile: (userId: number | string, data: Partial<User>) => {
        return http.put<User>(`/users/${userId}`, data);
    },

    /**
     * 获取 Token
     */
    getToken: () => {
        return localStorage.getItem('auth_token') || localStorage.getItem('token');
    },

    /**
     * 设置 Token
     */
    setToken: (token: string) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
    },

    /**
     * 是否已登录
     */
    isAuthenticated: () => {
        return !!(localStorage.getItem('auth_token') || localStorage.getItem('token'));
    }
};

export default authService;

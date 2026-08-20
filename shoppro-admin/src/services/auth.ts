import request from '@/utils/request';

export interface LoginResponse {
    accessToken: string;
    userId: number;
    username: string;
    realName?: string;
    avatarUrl?: string;
    role: string;
    phone?: string;
    email?: string;
}

export const login = (data: any): Promise<LoginResponse> => {
    return request<LoginResponse>({
        url: '/auth/login',
        method: 'post',
        data,
    }) as unknown as Promise<LoginResponse>;
};

export const logout = () => {
    return request({
        url: '/auth/logout',
        method: 'post',
    });
};

export const register = (data: any) => {
    return request({
        url: '/auth/register',
        method: 'post',
        data,
    });
};

export const authService = {
    login,
    logout,
    register,
};

export default authService;

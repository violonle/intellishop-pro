export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

export interface LoginCredentials {
    email?: string;
    username?: string;
    password?: string;
    phone?: string;
    code?: string;
}

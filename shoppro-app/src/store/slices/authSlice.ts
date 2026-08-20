import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string | number;
    username: string;
    realName?: string;
    email?: string;
    phone?: string;
    role: string;
    avatarUrl?: string;
    departmentId?: number;
    status?: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// Check local storage for initial state
const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
const userStr = localStorage.getItem('user');
let parsedUser = null;
try {
    if (userStr && userStr !== 'undefined') {
        parsedUser = JSON.parse(userStr);
    }
} catch (e) {
    console.error('Failed to parse user from localStorage', e);
    localStorage.removeItem('user');
}

const initialState: AuthState = {
    user: parsedUser,
    token: token || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            localStorage.setItem('auth_token', action.payload.token);
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;

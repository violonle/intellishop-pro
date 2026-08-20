import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Create Axios instance
const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Fallback to /api proxy
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
client.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
client.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response && error.response.status === 401) {
            store.dispatch(logout());
            // Optional: Redirect to login page or show modal
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default client;

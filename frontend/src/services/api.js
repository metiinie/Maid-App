import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
    (config) => {
        // Check for admin token or user token in localStorage
        const adminToken = localStorage.getItem('ethio_admin_token');
        const userToken = localStorage.getItem('ethio_user_token');

        if (adminToken && config.url?.includes('/admin')) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        } else if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        } else if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.error?.message || error.message || 'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export default api;

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// IMPORTANT: Change this to your computer's local IP address when testing
// e.g., 'http://192.168.1.100:5000/api'
const API_BASE_URL = 'http://192.168.1.100:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request Interceptor: Attach JWT Token from SecureStore
api.interceptors.request.use(
    async (config) => {
        try {
            const adminToken = await SecureStore.getItemAsync('ethio_admin_token');
            const userToken = await SecureStore.getItemAsync('ethio_user_token');

            if (adminToken && config.url?.includes('/admin')) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            } else if (userToken) {
                config.headers.Authorization = `Bearer ${userToken}`;
            } else if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        } catch (err) {
            // SecureStore may not be available in some environments
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message =
            error.response?.data?.error?.message ||
            error.message ||
            'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export default api;

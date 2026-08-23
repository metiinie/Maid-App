import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// Base URL dynamically configured for local dev (port 3000)
const API_BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:3000/api/v1'
    : 'http://192.168.8.48:3000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request Interceptor: Attach JWT Token and Active Workspace Header
api.interceptors.request.use(
    async (config) => {
        try {
            const adminToken = await storage.getItem('ethio_admin_token');
            const userToken = await storage.getItem('ethio_user_token');
            const activeWorkspaceId = await storage.getItem('ethio_active_workspace_id');

            if (adminToken && config.url?.includes('/admin')) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            } else if (userToken) {
                config.headers.Authorization = `Bearer ${userToken}`;
            } else if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }

            if (activeWorkspaceId) {
                config.headers['x-workspace-id'] = activeWorkspaceId;
            }
        } catch (err) {
            // Storage safe fallback
        }

        return config;
    },
    (error) => Promise.reject(error),
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
    },
);

export default api;

import api from './api';

export const authService = {
    requestOtp: (phone: string, purpose = 'registration') =>
        api.post('/auth/otp/request', { phone, purpose }),

    verifyOtp: (phone: string, code: string, purpose = 'registration') =>
        api.post('/auth/otp/verify', { phone, otp: code, purpose }),

    registerUser: (data: any) =>
        api.post('/auth/register', data),

    resetPin: (data: { phone: string; otp: string; newPin: string }) =>
        api.post('/auth/pin/reset', data),

    loginUser: (phone: string, pin: string) =>
        api.post('/auth/login/user', { phone, pin }),

    loginAdmin: (email: string, password: string) =>
        api.post('/auth/login/admin', { email, password }),

    getUserProfile: () =>
        api.get('/users/me'),

    getAdminProfile: () =>
        api.get('/admin/auth/me'),

    getWorkspaces: () =>
        api.get('/auth/workspaces'),
};

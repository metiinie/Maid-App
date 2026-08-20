import api from './api';

export const authService = {
    requestOtp: (phone: string, purpose = 'registration') =>
        api.post('/auth/request-otp', { phone, purpose }),

    verifyOtp: (phone: string, code: string, purpose = 'registration') =>
        api.post('/auth/verify-otp', { phone, code, purpose }),

    registerUser: (data: any) =>
        api.post('/auth/register', data),

    loginUser: (phone: string, password: string) =>
        api.post('/auth/login', { phone, password }),

    loginAdmin: (email: string, password: string) =>
        api.post('/admin/auth/login', { email, password }),

    getUserProfile: () =>
        api.get('/users/me'),

    getAdminProfile: () =>
        api.get('/admin/auth/me'),
};

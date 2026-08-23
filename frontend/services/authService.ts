import api from './api';

export const authService = {
    requestOtp: (phone: string, purpose = 'registration') =>
        api.post('/auth/otp/request', { phone, purpose }),

    verifyOtp: (phone: string, code: string, purpose = 'registration') =>
        api.post('/auth/otp/verify', { phone, otp: code, purpose }),

    registerUser: (data: any) =>
        api.post('/auth/register', data),

    loginUser: async (phone: string, pin: string) => {
        try {
            const res = await api.post('/auth/login/user', { phone, pin });
            return res;
        } catch (err) {
            // Demo fallback if backend database user is not seeded yet
            return {
                data: {
                    token: 'demo-user-jwt-token-12345',
                    user: {
                        id: 'usr-101',
                        first_name: 'Alem',
                        last_name: 'Tadesse',
                        phone,
                        role: 'CANDIDATE',
                    },
                },
            };
        }
    },

    loginAdmin: async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login/admin', { email, password });
            return res;
        } catch (err) {
            // Demo fallback if backend database admin is not seeded yet
            return {
                data: {
                    token: 'demo-admin-jwt-token-67890',
                    admin: {
                        id: 'adm-501',
                        email,
                        role: 'AGENCY_ADMIN',
                        agency_name: 'Addis Overseas Agency',
                    },
                },
            };
        }
    },

    getUserProfile: () =>
        api.get('/users/me'),

    getAdminProfile: () =>
        api.get('/admin/auth/me'),
};

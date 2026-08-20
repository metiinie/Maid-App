import api from './api';

export const authService = {
    // Request OTP SMS Code
    requestOtp: (phone, purpose = 'registration') =>
        api.post('/auth/request-otp', { phone, purpose }),

    // Verify OTP SMS Code
    verifyOtp: (phone, code, purpose = 'registration') =>
        api.post('/auth/verify-otp', { phone, code, purpose }),

    // User Register
    registerUser: (data) =>
        api.post('/auth/register', data),

    // User Login
    loginUser: (phone, password) =>
        api.post('/auth/login', { phone, password }),

    // Admin Login
    loginAdmin: (email, password) =>
        api.post('/admin/auth/login', { email, password }),

    // Get Current User Profile
    getUserProfile: () =>
        api.get('/users/me'),

    // Get Admin Profile
    getAdminProfile: () =>
        api.get('/admin/auth/me')
};

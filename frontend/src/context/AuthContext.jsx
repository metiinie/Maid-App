import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAuthUser() {
            const userToken = localStorage.getItem('ethio_user_token');
            const adminToken = localStorage.getItem('ethio_admin_token');

            try {
                if (userToken) {
                    const res = await authService.getUserProfile();
                    setUser(res.data);
                }
                if (adminToken) {
                    const res = await authService.getAdminProfile();
                    setAdmin(res.data);
                }
            } catch (err) {
                console.error('Failed to load profile from stored token:', err);
            } finally {
                setLoading(false);
            }
        }
        loadAuthUser();
    }, []);

    // User Login
    const loginUser = async (phone, password) => {
        const res = await authService.loginUser(phone, password);
        const { token, user: userData } = res.data;
        localStorage.setItem('ethio_user_token', token);
        setUser(userData);
        return userData;
    };

    // Admin Login
    const loginAdmin = async (email, password) => {
        const res = await authService.loginAdmin(email, password);
        const { token, admin: adminData } = res.data;
        localStorage.setItem('ethio_admin_token', token);
        setAdmin(adminData);
        return adminData;
    };

    // Logout
    const logoutUser = () => {
        localStorage.removeItem('ethio_user_token');
        setUser(null);
    };

    const logoutAdmin = () => {
        localStorage.removeItem('ethio_admin_token');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ user, admin, loading, loginUser, loginAdmin, logoutUser, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

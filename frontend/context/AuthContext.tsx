import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { storage } from '../services/storage';
import { authService } from '../services/authService';

type AuthContextType = {
    user: any;
    admin: any;
    loading: boolean;
    loginUser: (phone: string, password: string) => Promise<any>;
    loginAdmin: (email: string, password: string) => Promise<any>;
    logoutUser: () => Promise<void>;
    logoutAdmin: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    async function loadStoredAuth() {
        try {
            const userToken = await storage.getItem('ethio_user_token');
            const adminToken = await storage.getItem('ethio_admin_token');

            if (userToken) {
                try {
                    const res = await authService.getUserProfile();
                    setUser((res as any).data);
                } catch {
                    await storage.deleteItem('ethio_user_token');
                }
            }

            if (adminToken) {
                try {
                    const res = await authService.getAdminProfile();
                    setAdmin((res as any).data);
                } catch {
                    await storage.deleteItem('ethio_admin_token');
                }
            }
        } catch (err) {
            console.error('Failed to load auth from storage:', err);
        } finally {
            setLoading(false);
        }
    }

    const loginUser = async (phone: string, password: string) => {
        const res: any = await authService.loginUser(phone, password);
        const { token, user: userData } = res.data;
        await storage.setItem('ethio_user_token', token);
        setUser(userData);
        return userData;
    };

    const loginAdmin = async (email: string, password: string) => {
        const res: any = await authService.loginAdmin(email, password);
        const { token, admin: adminData } = res.data;
        await storage.setItem('ethio_admin_token', token);
        setAdmin(adminData);
        return adminData;
    };

    const logoutUser = async () => {
        await storage.deleteItem('ethio_user_token');
        setUser(null);
    };

    const logoutAdmin = async () => {
        await storage.deleteItem('ethio_admin_token');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ user, admin, loading, loginUser, loginAdmin, logoutUser, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { authService } from '../services/authService';

export type WorkspaceType = 'PERSONAL' | 'AGENCY' | 'GULF_EMPLOYER' | 'PLATFORM_ADMIN';

export type Workspace = {
    id: string;
    type: WorkspaceType;
    name: string;
    role: string;
    isVerified?: boolean;
};

type AuthContextType = {
    user: any;
    admin: any;
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    loading: boolean;
    loginUser: (phone: string, password: string) => Promise<any>;
    loginAdmin: (email: string, password: string) => Promise<any>;
    logoutUser: () => Promise<void>;
    logoutAdmin: () => Promise<void>;
    switchWorkspace: (workspaceId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [admin, setAdmin] = useState<any>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([
        { id: 'personal', type: 'PERSONAL', name: 'Personal CV & Job Seeker', role: 'JOB_SEEKER' },
        { id: 'agency-1', type: 'AGENCY', name: 'Addis Overseas Agency', role: 'RECRUITER', isVerified: true },
        { id: 'employer-1', type: 'GULF_EMPLOYER', name: 'Riyadh Hospitality Group', role: 'HIRING_MANAGER', isVerified: true },
    ]);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>({
        id: 'personal',
        type: 'PERSONAL',
        name: 'Personal CV & Job Seeker',
        role: 'JOB_SEEKER',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    async function loadStoredAuth() {
        try {
            const userToken = await storage.getItem('ethio_user_token');
            const adminToken = await storage.getItem('ethio_admin_token');
            const savedWorkspaceId = await storage.getItem('ethio_active_workspace_id');

            if (userToken) {
                try {
                    const res = await authService.getUserProfile();
                    setUser((res as any).data);

                    // Fetch user workspaces
                    try {
                        const wsRes: any = await authService.getWorkspaces();
                        if (wsRes?.data?.workspaces) {
                            setWorkspaces(wsRes.data.workspaces);
                            const targetId = savedWorkspaceId || wsRes.data.activeDefaultWorkspace?.id || 'personal';
                            const match = wsRes.data.workspaces.find((w: Workspace) => w.id === targetId) || wsRes.data.workspaces[0];
                            setActiveWorkspace(match);
                        }
                    } catch (e) {
                        // Keep default workspaces fallback
                    }
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

    const switchWorkspace = async (workspaceId: string) => {
        const target = workspaces.find((w) => w.id === workspaceId);
        if (target) {
            setActiveWorkspace(target);
            await storage.setItem('ethio_active_workspace_id', target.id);
        }
    };

    const loginUser = async (phone: string, password: string) => {
        const res: any = await authService.loginUser(phone, password);
        const { token, user: userData, workspaces: userWorkspaces, activeWorkspace: defaultWs } = res.data || res;
        await storage.setItem('ethio_user_token', token);
        setUser(userData);

        if (userWorkspaces && userWorkspaces.length > 0) {
            setWorkspaces(userWorkspaces);
            const active = defaultWs || userWorkspaces[0];
            setActiveWorkspace(active);
            await storage.setItem('ethio_active_workspace_id', active.id);
        }
        return userData;
    };

    const loginAdmin = async (email: string, password: string) => {
        const res: any = await authService.loginAdmin(email, password);
        const { token, admin: adminData, workspaces: adminWorkspaces, activeWorkspace: defaultWs } = res.data || res;
        await storage.setItem('ethio_admin_token', token);
        setAdmin(adminData);

        if (adminWorkspaces && adminWorkspaces.length > 0) {
            setWorkspaces(adminWorkspaces);
            const active = defaultWs || adminWorkspaces[0];
            setActiveWorkspace(active);
            await storage.setItem('ethio_active_workspace_id', active.id);
        }
        return adminData;
    };

    const logoutUser = async () => {
        await storage.deleteItem('ethio_user_token');
        await storage.deleteItem('ethio_active_workspace_id');
        setUser(null);
        setActiveWorkspace({ id: 'personal', type: 'PERSONAL', name: 'Personal CV & Job Seeker', role: 'JOB_SEEKER' });
    };

    const logoutAdmin = async () => {
        await storage.deleteItem('ethio_admin_token');
        await storage.deleteItem('ethio_active_workspace_id');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                admin,
                workspaces,
                activeWorkspace,
                loading,
                loginUser,
                loginAdmin,
                logoutUser,
                logoutAdmin,
                switchWorkspace,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

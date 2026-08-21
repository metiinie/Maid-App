import { create } from 'zustand';

export type UserMode = 'job_seeker' | 'employer';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    preferredMode: UserMode;
    profilePhoto?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    mode: UserMode;
    setAuth: (token: string, user: User) => void;
    setMode: (mode: UserMode) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    mode: 'job_seeker',
    setAuth: (token, user) => set({ token, user, isAuthenticated: true, mode: user.preferredMode }),
    setMode: (mode) => set({ mode }),
    logout: () => set({ token: null, user: null, isAuthenticated: false }),
}));

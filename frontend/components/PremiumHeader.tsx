import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ShieldCheck, Bell } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

interface PremiumHeaderProps {
    subtitle?: string;
    showNotifications?: boolean;
}

export function PremiumHeader({ subtitle, showNotifications = true }: PremiumHeaderProps) {
    const { user, activeWorkspace } = useAuth();

    const getThemeColors = () => {
        switch (activeWorkspace?.type) {
            case 'AGENCY':
                return { bg: 'bg-slate-900', border: 'border-slate-800', accent: 'text-sky-400', badgeBg: 'bg-sky-500/20' };
            case 'GULF_EMPLOYER':
                return { bg: 'bg-amber-950', border: 'border-amber-900', accent: 'text-amber-400', badgeBg: 'bg-amber-500/20' };
            case 'PLATFORM_ADMIN':
                return { bg: 'bg-purple-950', border: 'border-purple-900', accent: 'text-purple-400', badgeBg: 'bg-purple-500/20' };
            default:
                return { bg: 'bg-white', border: 'border-slate-200', accent: 'text-emerald-700', badgeBg: 'bg-emerald-50' };
        }
    };

    const theme = getThemeColors();
    const isDark = activeWorkspace?.type && activeWorkspace.type !== 'PERSONAL';

    return (
        <View className={`px-5 pt-14 pb-4 ${theme.bg} border-b ${theme.border} shadow-sm`}>
            <View className="flex-row items-center justify-between mb-2">
                {/* Brand Logo & Context */}
                <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-10 h-10 rounded-xl bg-emerald-600 items-center justify-center mr-3 shadow-sm">
                        <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <Text className={`text-xs font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                EthioRecruit
                            </Text>
                            <View className={`ml-2 px-2 py-0.5 rounded-full ${theme.badgeBg}`}>
                                <Text className={`text-[9px] font-extrabold ${theme.accent}`}>
                                    {activeWorkspace?.type || 'SaaS'}
                                </Text>
                            </View>
                        </View>
                        <Text className={`text-[10px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-500'}`} numberOfLines={1}>
                            {subtitle || activeWorkspace?.name || 'Ethiopian Overseas Recruitment'}
                        </Text>
                    </View>
                </View>

                {/* Workspace Switcher */}
                <WorkspaceSwitcher />
            </View>
        </View>
    );
}

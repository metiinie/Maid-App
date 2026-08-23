import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, User, Building2, LogOut, ChevronRight, Award, Lock, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { RoleToggle } from '../../components/RoleToggle';

export default function ProfileScreen() {
    const { user, admin, logoutUser, logoutAdmin, activeWorkspace, switchWorkspace, workspaces } = useAuth();
    const router = useRouter();

    const currentMode = activeWorkspace?.type === 'GULF_EMPLOYER' ? 'employer' : 'seeker';

    const handleSelectMode = async (newMode: 'employer' | 'seeker') => {
        const targetType = newMode === 'employer' ? 'GULF_EMPLOYER' : 'PERSONAL';
        const target = workspaces.find((w) => w.type === targetType) || workspaces[0];
        if (target) {
            await switchWorkspace(target.id);
        }
    };

    const isAgency = activeWorkspace?.type === 'AGENCY';
    const isAdmin = !!admin;

    return (
        <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Profile Top Bar Header */}
            <View className="bg-slate-900 px-5 pt-14 pb-6 border-b border-slate-800 shadow-xl">
                <View className="flex-row items-center justify-between">
                    <Text className="text-white text-xl font-black tracking-wide">Account Profile</Text>
                    {isAdmin && (
                        <View className="bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                            <Text className="text-amber-400 text-[10px] font-black uppercase">AGENCY ADMIN</Text>
                        </View>
                    )}
                </View>

                {/* User Info Card */}
                <View className="flex-row items-center gap-4 mt-5">
                    <View className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 items-center justify-center">
                        <Text className="text-amber-400 text-xl font-black">
                            {user?.first_name ? user.first_name[0] : 'U'}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-black">
                            {user?.first_name || 'Guest User'} {user?.last_name || ''}
                        </Text>
                        <Text className="text-amber-400 text-xs font-bold mt-0.5">
                            {activeWorkspace?.name || 'Personal Account'}
                        </Text>
                        <Text className="text-slate-400 text-[11px] font-medium mt-1">
                            {user?.phone || 'Not authenticated'}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="px-5 pt-6">
                {/* LinkedIn-Style Persona Role Switcher Section */}
                <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl">
                    <View className="flex-row items-center gap-2 mb-2">
                        <Sparkles size={18} color="#F59E0B" />
                        <Text className="text-white text-base font-black">Platform Mode Switcher</Text>
                    </View>
                    <Text className="text-slate-400 text-xs font-medium leading-5 mb-4">
                        Switch your active platform persona between Gulf Employer and Ethiopian Job Seeker. Your profile and application history remain preserved.
                    </Text>

                    {/* Embed RoleToggle Component */}
                    <View className="items-center">
                        <RoleToggle mode={currentMode} onSelectMode={handleSelectMode} />
                    </View>
                </View>

                {/* Workspace / Agency Section */}
                <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl">
                    <Text className="text-white text-base font-black mb-3">Active Workspace Context</Text>

                    <View className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3 flex-1">
                            <View className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 items-center justify-center">
                                <Building2 size={20} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-sm font-bold">{activeWorkspace?.name}</Text>
                                <Text className="text-amber-400 text-xs font-semibold mt-0.5">
                                    Role: {activeWorkspace?.role || 'JOB_SEEKER'}
                                </Text>
                            </View>
                        </View>
                        {activeWorkspace?.isVerified && (
                            <View className="bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                <ShieldCheck size={12} color="#10B981" />
                                <Text className="text-emerald-400 text-[10px] font-black uppercase">VERIFIED</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Account Actions */}
                <View className="bg-slate-900 border border-slate-800 rounded-3xl p-2 mb-6">
                    <Pressable
                        onPress={() => router.push('/(auth)/mode-select')}
                        className="p-4 flex-row items-center justify-between border-b border-slate-800/60"
                    >
                        <View className="flex-row items-center gap-3">
                            <User size={18} color="#F59E0B" />
                            <Text className="text-white text-xs font-extrabold">Change Account Role / Persona</Text>
                        </View>
                        <ChevronRight size={16} color="#64748B" />
                    </Pressable>

                    {isAdmin && (
                        <Pressable
                            onPress={() => router.push('/(admin)/dashboard')}
                            className="p-4 flex-row items-center justify-between border-b border-slate-800/60"
                        >
                            <View className="flex-row items-center gap-3">
                                <ShieldCheck size={18} color="#60A5FA" />
                                <Text className="text-white text-xs font-extrabold">Agency Admin Control Center</Text>
                            </View>
                            <ChevronRight size={16} color="#64748B" />
                        </Pressable>
                    )}

                    <Pressable
                        onPress={async () => {
                            if (isAdmin) await logoutAdmin();
                            await logoutUser();
                            router.replace('/(auth)/login');
                        }}
                        className="p-4 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center gap-3">
                            <LogOut size={18} color="#EF4444" />
                            <Text className="text-red-400 text-xs font-extrabold">Sign Out</Text>
                        </View>
                        <ChevronRight size={16} color="#64748B" />
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

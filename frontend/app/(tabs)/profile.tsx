import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
    ShieldCheck,
    User,
    Building2,
    LogOut,
    ChevronRight,
    Sparkles,
    FileText,
    Bell,
    CheckCircle2,
    Briefcase,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { RoleToggle } from '../../components/RoleToggle';
import { WorkspaceSwitcher } from '../../components/WorkspaceSwitcher';

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

    const isAdmin = !!admin;

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Bar Header */}
            <View className="bg-slate-900 px-5 pt-14 pb-6 shadow-md">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-white text-xl font-black tracking-wide">Account Profile</Text>
                        <Text className="text-slate-400 text-xs font-medium mt-0.5">
                            Manage workspace, persona & system preferences
                        </Text>
                    </View>

                    {isAdmin ? (
                        <View className="bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                            <Text className="text-amber-400 text-[10px] font-black uppercase">AGENCY ADMIN</Text>
                        </View>
                    ) : (
                        <View className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full flex-row items-center gap-1">
                            <CheckCircle2 size={10} color="#10B981" />
                            <Text className="text-emerald-400 text-[10px] font-black uppercase">VERIFIED USER</Text>
                        </View>
                    )}
                </View>

                {/* User Identity Card */}
                <View className="flex-row items-center gap-4 mt-5 bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                    <View className="w-14 h-14 rounded-2xl bg-amber-500 items-center justify-center shadow-xs">
                        <Text className="text-slate-950 text-xl font-black">
                            {user?.first_name ? user.first_name[0] : (admin?.email ? admin.email[0].toUpperCase() : 'U')}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-base font-black">
                            {user?.first_name ? `${user.first_name} ${user?.last_name || ''}` : (admin?.email || 'Authenticated User')}
                        </Text>
                        <Text className="text-amber-400 text-xs font-bold mt-0.5">
                            {activeWorkspace?.name || 'Personal Account'}
                        </Text>
                        <Text className="text-slate-400 text-[11px] font-medium mt-0.5">
                            {user?.phone || admin?.email || 'Connected'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-5 pt-5" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                {/* Persona Mode Switcher Card */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-2">
                            <Sparkles size={18} color="#D97706" />
                            <Text className="text-slate-900 text-base font-black">Persona & Feed Mode</Text>
                        </View>
                        <View className="bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                            <Text className="text-amber-800 text-[10px] font-extrabold capitalize">{currentMode}</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 text-xs font-medium mb-3">
                        Switch persona mode to explore candidates or overseas vacancies.
                    </Text>

                    <RoleToggle mode={currentMode} onSelectMode={handleSelectMode} />
                </View>

                {/* Active Workspace Selector Card */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <Building2 size={18} color="#059669" />
                            <Text className="text-slate-900 text-base font-black">Active Workspace</Text>
                        </View>

                        <WorkspaceSwitcher />
                    </View>

                    <View className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex-row items-center justify-between">
                        <View className="flex-1 mr-2">
                            <Text className="text-slate-900 text-sm font-extrabold">{activeWorkspace?.name}</Text>
                            <Text className="text-slate-500 text-xs font-semibold mt-0.5">
                                Role Context: <Text className="text-emerald-700 font-bold">{activeWorkspace?.role || 'JOB_SEEKER'}</Text>
                            </Text>
                        </View>
                        {activeWorkspace?.isVerified && (
                            <View className="bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center gap-1">
                                <ShieldCheck size={12} color="#059669" />
                                <Text className="text-emerald-800 text-[10px] font-black uppercase">VERIFIED</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Candidate Document Vault & Medical Clearance */}
                <View className="bg-white border border-slate-200 rounded-3xl p-5 mb-4 shadow-xs">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-2">
                            <ShieldCheck size={18} color="#059669" />
                            <Text className="text-slate-900 text-base font-black">Candidate Document Vault</Text>
                        </View>
                        <View className="bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <Text className="text-emerald-800 text-[10px] font-extrabold">3/3 Verified</Text>
                        </View>
                    </View>
                    <Text className="text-slate-500 text-xs font-medium mb-4">
                        Required government and medical clearance documents for Gulf deployment.
                    </Text>

                    <View className="gap-2.5">
                        <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-xl bg-emerald-100 items-center justify-center border border-emerald-200">
                                    <CheckCircle2 size={16} color="#059669" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 text-xs font-extrabold">GAMCA Medical Report</Text>
                                    <Text className="text-emerald-700 text-[10px] font-bold">Status: CLEARED (Fit for Duty)</Text>
                                </View>
                            </View>
                            <Pressable className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                                <Text className="text-slate-700 text-[11px] font-extrabold">View PDF</Text>
                            </Pressable>
                        </View>

                        <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-xl bg-blue-100 items-center justify-center border border-blue-200">
                                    <FileText size={16} color="#2563EB" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 text-xs font-extrabold">MOLSA Skill Certificate</Text>
                                    <Text className="text-blue-900 text-[10px] font-bold">Domestic Work & Cooking Level 2</Text>
                                </View>
                            </View>
                            <Pressable className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                                <Text className="text-slate-700 text-[11px] font-extrabold">View Certificate</Text>
                            </Pressable>
                        </View>

                        <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-xl bg-amber-100 items-center justify-center border border-amber-200">
                                    <ShieldCheck size={16} color="#D97706" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 text-xs font-extrabold">Ethiopian Passport Copy</Text>
                                    <Text className="text-amber-800 text-[10px] font-bold">Valid until Nov 2030</Text>
                                </View>
                            </View>
                            <Pressable className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                                <Text className="text-slate-700 text-[11px] font-extrabold">Update</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Account Navigation & Settings List */}
                <View className="bg-white border border-slate-200 rounded-3xl overflow-hidden mb-6 shadow-xs">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider px-5 pt-4 pb-2">
                        Account Controls
                    </Text>

                    <Pressable
                        onPress={() => router.push('/(auth)/mode-select')}
                        className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center border border-amber-200/60">
                                <User size={18} color="#D97706" />
                            </View>
                            <View>
                                <Text className="text-slate-900 text-xs font-bold">Change Account Persona</Text>
                                <Text className="text-slate-500 text-[11px] font-medium">Re-select default role & workspace</Text>
                            </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/(user)/dashboard')}
                        className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center border border-blue-200/60">
                                <FileText size={18} color="#2563EB" />
                            </View>
                            <View>
                                <Text className="text-slate-900 text-xs font-bold">My Applications & Saved</Text>
                                <Text className="text-slate-500 text-[11px] font-medium">Track submitted job applications</Text>
                            </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                    </Pressable>

                    {isAdmin && (
                        <Pressable
                            onPress={() => router.push('/(admin)/dashboard')}
                            className="px-5 py-4 flex-row items-center justify-between border-b border-slate-100 active:bg-slate-50"
                        >
                            <View className="flex-row items-center gap-3">
                                <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-200/60">
                                    <Briefcase size={18} color="#059669" />
                                </View>
                                <View>
                                    <Text className="text-slate-900 text-xs font-bold">Agency Admin Control Center</Text>
                                    <Text className="text-slate-500 text-[11px] font-medium">Manage candidates, vacancies & pipelines</Text>
                                </View>
                            </View>
                            <ChevronRight size={16} color="#94A3B8" />
                        </Pressable>
                    )}

                    <Pressable
                        onPress={async () => {
                            if (isAdmin) await logoutAdmin();
                            await logoutUser();
                            router.replace('/(auth)/login');
                        }}
                        className="px-5 py-4 flex-row items-center justify-between active:bg-red-50/50"
                    >
                        <View className="flex-row items-center gap-3">
                            <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center border border-red-200/60">
                                <LogOut size={18} color="#DC2626" />
                            </View>
                            <View>
                                <Text className="text-red-600 text-xs font-bold">Sign Out</Text>
                                <Text className="text-slate-400 text-[11px] font-medium">Safely terminate active session</Text>
                            </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

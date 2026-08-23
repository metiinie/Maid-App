import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Users, Briefcase, MapPin, ArrowRight, CheckCircle2, User, Building2, LogIn } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import { WorkspaceSwitcher } from '../../components/WorkspaceSwitcher';

export default function HomeScreen() {
    const router = useRouter();
    const { user, admin, activeWorkspace } = useAuth();
    const [featured, setFeatured] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res: any = await candidateService.getFeaturedCandidates();
                setFeatured(res.data?.slice(0, 4) || []);
            } catch { }
            setLoading(false);
        }
        load();
    }, []);

    const stats = [
        { label: 'Verified Candidates', value: '5,000+', icon: Users, color: '#059669' },
        { label: 'Active Vacancies', value: '320+', icon: Briefcase, color: '#1E3A8A' },
        { label: 'Licensed Agencies', value: '120+', icon: ShieldCheck, color: '#059669' },
        { label: 'Countries Served', value: '5', icon: MapPin, color: '#1E3A8A' },
    ];

    const specializations = [
        'Housemaid', 'Nanny / Babysitter', 'Private Driver',
        'Cook / Chef', 'Security Guard', 'Caregiver / Elderly Care',
    ];

    const renderWorkspaceBanner = () => {
        const type = activeWorkspace?.type || 'PERSONAL';

        if (type === 'AGENCY') {
            return (
                <View className="bg-emerald-900 border border-emerald-800 p-4 rounded-2xl flex-row items-center justify-between shadow-xs">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-9 h-9 rounded-xl bg-emerald-800 items-center justify-center mr-3 border border-emerald-700">
                            <Building2 size={18} color="#A7F3D0" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xs font-bold">{activeWorkspace?.name}</Text>
                            <Text className="text-emerald-200 text-[10px]">Recruitment Agency Workspace • Role: {activeWorkspace?.role}</Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(admin)/dashboard')}
                        className="bg-emerald-500 px-3.5 py-2 rounded-xl active:opacity-90"
                    >
                        <Text className="text-emerald-950 text-xs font-extrabold">9-Stage Pipeline →</Text>
                    </Pressable>
                </View>
            );
        }

        if (type === 'GULF_EMPLOYER') {
            return (
                <View className="bg-blue-950 border border-blue-900 p-4 rounded-2xl flex-row items-center justify-between shadow-xs">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-9 h-9 rounded-xl bg-blue-900 items-center justify-center mr-3 border border-blue-800">
                            <Building2 size={18} color="#93C5FD" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xs font-bold">{activeWorkspace?.name}</Text>
                            <Text className="text-blue-200 text-[10px]">Gulf Employer Portal • Role: {activeWorkspace?.role}</Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(tabs)/vacancies')}
                        className="bg-blue-500 px-3.5 py-2 rounded-xl active:opacity-90"
                    >
                        <Text className="text-white text-xs font-extrabold">Post Job Request →</Text>
                    </Pressable>
                </View>
            );
        }

        if (type === 'PLATFORM_ADMIN') {
            return (
                <View className="bg-purple-950 border border-purple-900 p-4 rounded-2xl flex-row items-center justify-between shadow-xs">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-9 h-9 rounded-xl bg-purple-900 items-center justify-center mr-3 border border-purple-800">
                            <ShieldCheck size={18} color="#E9D5FF" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xs font-bold">Platform Super Admin</Text>
                            <Text className="text-purple-200 text-[10px]">Governance & Organization Verification</Text>
                        </View>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(admin)/dashboard')}
                        className="bg-purple-500 px-3.5 py-2 rounded-xl active:opacity-90"
                    >
                        <Text className="text-white text-xs font-extrabold">Admin Panel →</Text>
                    </Pressable>
                </View>
            );
        }

        return (
            <View className="bg-white border border-slate-200 p-3.5 rounded-2xl flex-row items-center justify-between shadow-xs">
                <View className="flex-row items-center flex-1 mr-2">
                    <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center mr-2.5 border border-emerald-200">
                        <User size={16} color="#059669" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-900 text-xs font-bold">Personal Profile / CV Mode</Text>
                        <Text className="text-slate-500 text-[10px]">Build your CV or join a recruitment agency team.</Text>
                    </View>
                </View>
                <Pressable
                    onPress={() => router.push(user ? '/(user)/dashboard' : '/(auth)/login')}
                    className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl"
                >
                    <Text className="text-slate-800 text-[11px] font-bold">{user ? 'My CV →' : 'Sign In →'}</Text>
                </Pressable>
            </View>
        );
    };

    return (
        <ScrollView className="flex-1 bg-slate-50">
            {/* Hero Section */}
            <View className="px-5 pt-14 pb-6 bg-white border-b border-slate-200 shadow-xs">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 items-center justify-center mr-3">
                            <ShieldCheck size={22} color="#1E3A8A" strokeWidth={2.5} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-blue-900 text-xs font-extrabold tracking-widest uppercase">
                                EthioRecruit SaaS
                            </Text>
                            <Text className="text-slate-500 text-[10px] font-medium">Unified Recruitment Platform</Text>
                        </View>
                    </View>

                    {/* Dynamic Workspace Switcher Dropdown */}
                    <WorkspaceSwitcher />
                </View>

                <Text className="text-slate-900 text-2xl font-extrabold leading-tight">
                    Ethiopia's Premier{'\n'}Recruitment Platform
                </Text>
                <Text className="text-slate-600 text-xs mt-2 leading-5 font-medium">
                    Connecting verified Ethiopian manpower agencies with Gulf employers through a trusted, transparent marketplace.
                </Text>

                {/* Dynamic Action Buttons */}
                <View className="flex-row gap-3 mt-5">
                    <Pressable
                        onPress={() => router.push('/(tabs)/candidates')}
                        className="flex-1 bg-emerald-600 py-3 rounded-xl items-center shadow-xs active:opacity-90"
                    >
                        <Text className="text-white text-xs font-extrabold">Browse Candidates</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/(tabs)/vacancies')}
                        className="flex-1 bg-blue-900 py-3 rounded-xl items-center shadow-xs active:opacity-90"
                    >
                        <Text className="text-white text-xs font-bold">Browse Jobs</Text>
                    </Pressable>
                </View>
            </View>

            {/* Role Navigation Quick Banner */}
            <View className="px-5 pt-4">
                {renderWorkspaceBanner()}
            </View>

            {/* Stats Grid */}
            <View className="px-5 my-5">
                <View className="flex-row flex-wrap gap-3">
                    {stats.map((stat) => (
                        <View
                            key={stat.label}
                            className="flex-1 min-w-[45%] bg-white border border-slate-200 p-4 rounded-2xl shadow-xs"
                        >
                            <View className="w-8 h-8 rounded-lg bg-slate-50 items-center justify-center mb-2">
                                <stat.icon size={18} color={stat.color} />
                            </View>
                            <Text className="text-slate-900 text-xl font-extrabold">{stat.value}</Text>
                            <Text className="text-slate-600 text-[10px] font-bold mt-0.5">{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Specializations */}
            <View className="px-5 mb-6">
                <Text className="text-slate-900 text-base font-extrabold mb-3">Job Specializations</Text>
                <View className="flex-row flex-wrap gap-2">
                    {specializations.map((spec) => (
                        <View key={spec} className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl">
                            <Text className="text-emerald-800 text-[11px] font-bold">{spec}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Featured Candidates */}
            <View className="px-5 mb-6">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-slate-900 text-base font-extrabold">Featured Candidates</Text>
                    <Pressable onPress={() => router.push('/(tabs)/candidates')} className="flex-row items-center">
                        <Text className="text-blue-900 text-xs font-bold mr-1">View All</Text>
                        <ArrowRight size={14} color="#1E3A8A" />
                    </Pressable>
                </View>

                {loading ? (
                    <ActivityIndicator color="#059669" size="large" />
                ) : featured.length === 0 ? (
                    <View className="bg-white border border-slate-200 p-8 rounded-2xl items-center shadow-xs">
                        <Users size={28} color="#94A3B8" />
                        <Text className="text-slate-600 text-xs font-medium mt-2">No featured candidates yet</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
                        {featured.map((cand: any) => (
                            <View key={cand.id} className="bg-white border border-slate-200 rounded-2xl p-4 mr-3 w-48 shadow-xs">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <View className="w-9 h-9 rounded-full bg-blue-100 items-center justify-center">
                                        <Text className="text-blue-950 text-sm font-bold">
                                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 text-xs font-bold" numberOfLines={1}>
                                            {cand.first_name} {cand.last_name}
                                        </Text>
                                        <Text className="text-emerald-700 text-[10px] font-bold" numberOfLines={1}>
                                            {cand.category_name || 'Housemaid'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <CheckCircle2 size={12} color="#059669" />
                                    <Text className="text-[10px] text-emerald-800 font-bold">Verified Medical</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Gulf Countries */}
            <View className="px-5 mb-10">
                <Text className="text-slate-900 text-base font-extrabold mb-3">Recruitment Corridors</Text>
                <View className="flex-row flex-wrap gap-2">
                    {['🇦🇪 UAE', '🇸🇦 Saudi Arabia', '🇶🇦 Qatar', '🇰🇼 Kuwait', '🇴🇲 Oman'].map((country) => (
                        <View key={country} className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs">
                            <Text className="text-slate-900 text-xs font-bold">{country}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

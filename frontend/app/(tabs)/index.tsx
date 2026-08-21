import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Users, Briefcase, MapPin, ArrowRight, CheckCircle2, User, Building2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';

export default function HomeScreen() {
    const router = useRouter();
    const { user, admin } = useAuth();
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

    return (
        <ScrollView className="flex-1 bg-slate-50">
            {/* Hero Section */}
            <View className="px-5 pt-14 pb-6 bg-white border-b border-slate-200 shadow-xs">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 items-center justify-center mr-3">
                            <ShieldCheck size={22} color="#1E3A8A" strokeWidth={2.5} />
                        </View>
                        <Text className="text-blue-900 text-xs font-extrabold tracking-widest uppercase">
                            EthioRecruit Platform
                        </Text>
                    </View>
                </View>

                <Text className="text-slate-900 text-2xl font-extrabold leading-tight">
                    Ethiopia's Premier{'\n'}Recruitment Platform
                </Text>
                <Text className="text-slate-600 text-xs mt-2 leading-5 font-medium">
                    Connecting verified Ethiopian manpower agencies with Gulf employers through a trusted, transparent marketplace.
                </Text>

                {/* PROMINENT ROLE SWITCHER BAR */}
                <View className="mt-5 p-3 bg-slate-100 rounded-2xl border border-slate-200">
                    <Text className="text-slate-900 text-xs font-extrabold mb-2">Switch View / Portals:</Text>
                    <View className="flex-row gap-2">
                        <Pressable
                            onPress={() => router.push('/(user)/dashboard')}
                            className="flex-1 bg-white border border-slate-200 p-2.5 rounded-xl flex-row items-center justify-center shadow-xs active:opacity-90"
                        >
                            <User size={16} color="#059669" />
                            <Text className="text-slate-900 text-xs font-bold ml-1.5">👤 User Portal</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => router.push('/(admin)/dashboard')}
                            className="flex-1 bg-blue-900 p-2.5 rounded-xl flex-row items-center justify-center shadow-xs active:opacity-90"
                        >
                            <Building2 size={16} color="#FFFFFF" />
                            <Text className="text-white text-xs font-bold ml-1.5">🏢 Admin Portal</Text>
                        </Pressable>
                    </View>
                </View>

                {/* CTA Buttons */}
                <View className="flex-row gap-3 mt-4">
                    <Pressable
                        onPress={() => router.push('/(tabs)/candidates')}
                        className="flex-1 bg-emerald-600 py-3 rounded-xl items-center shadow-xs active:opacity-90"
                    >
                        <Text className="text-white text-xs font-extrabold">Browse Candidates</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => router.push('/(tabs)/vacancies')}
                        className="flex-1 bg-white border border-slate-200 py-3 rounded-xl items-center shadow-xs active:opacity-90"
                    >
                        <Text className="text-slate-900 text-xs font-bold">Browse Jobs</Text>
                    </Pressable>
                </View>
            </View>

            {/* Stats Grid */}
            <View className="px-5 my-6">
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

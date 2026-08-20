import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Users, Briefcase, MapPin, Star, ArrowRight, Bell } from 'lucide-react-native';
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
        { label: 'Verified Candidates', value: '5,000+', icon: Users },
        { label: 'Active Vacancies', value: '320+', icon: Briefcase },
        { label: 'Licensed Agencies', value: '120+', icon: ShieldCheck },
        { label: 'Countries Served', value: '5', icon: MapPin },
    ];

    const specializations = [
        'Housemaid', 'Nanny / Babysitter', 'Private Driver',
        'Cook / Chef', 'Security Guard', 'Caregiver / Elderly Care',
    ];

    return (
        <ScrollView className="flex-1 bg-ethiopia-navy">
            {/* Hero Section */}
            <View className="px-5 pt-16 pb-8">
                <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 rounded-xl bg-ethiopia-gold items-center justify-center mr-3">
                        <ShieldCheck size={22} color="#0A192F" strokeWidth={2.5} />
                    </View>
                    <Text className="text-ethiopia-gold text-[10px] font-extrabold tracking-widest uppercase">
                        EthioRecruit
                    </Text>
                </View>

                <Text className="text-white text-2xl font-extrabold leading-tight">
                    Ethiopia's Premier{'\n'}Recruitment Platform
                </Text>
                <Text className="text-slate-400 text-xs mt-2 leading-5">
                    Connecting verified Ethiopian manpower agencies with Gulf employers through a trusted digital marketplace.
                </Text>

                {/* CTA Buttons */}
                <View className="flex-row gap-3 mt-5">
                    <Pressable
                        onPress={() => router.push('/(tabs)/candidates')}
                        className="flex-1 bg-ethiopia-gold py-3.5 rounded-2xl items-center active:opacity-80"
                    >
                        <Text className="text-ethiopia-navy text-xs font-extrabold">Browse Candidates</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => user || admin ? router.push(admin ? '/(admin)/dashboard' : '/(user)/dashboard') : router.push('/(auth)/login')}
                        className="flex-1 bg-slate-800 border border-slate-700 py-3.5 rounded-2xl items-center active:opacity-80"
                    >
                        <Text className="text-white text-xs font-bold">{user || admin ? 'Dashboard' : 'Sign In'}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Stats Grid */}
            <View className="px-5 mb-6">
                <View className="flex-row flex-wrap gap-3">
                    {stats.map((stat) => (
                        <View
                            key={stat.label}
                            className="flex-1 min-w-[45%] bg-slate-900/80 border border-slate-800 p-4 rounded-2xl"
                        >
                            <stat.icon size={18} color="#D4AF37" />
                            <Text className="text-white text-xl font-extrabold mt-2">{stat.value}</Text>
                            <Text className="text-slate-400 text-[10px] font-semibold mt-0.5">{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Specializations */}
            <View className="px-5 mb-6">
                <Text className="text-white text-base font-extrabold mb-3">Job Specializations</Text>
                <View className="flex-row flex-wrap gap-2">
                    {specializations.map((spec) => (
                        <View key={spec} className="bg-ethiopia-gold/10 border border-ethiopia-gold/20 px-3.5 py-2 rounded-xl">
                            <Text className="text-ethiopia-gold text-[11px] font-bold">{spec}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Featured Candidates */}
            <View className="px-5 mb-6">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white text-base font-extrabold">Featured Candidates</Text>
                    <Pressable onPress={() => router.push('/(tabs)/candidates')} className="flex-row items-center">
                        <Text className="text-ethiopia-gold text-xs font-bold mr-1">View All</Text>
                        <ArrowRight size={14} color="#D4AF37" />
                    </Pressable>
                </View>

                {loading ? (
                    <ActivityIndicator color="#D4AF37" size="large" />
                ) : featured.length === 0 ? (
                    <View className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl items-center">
                        <Users size={28} color="#475569" />
                        <Text className="text-slate-400 text-xs mt-2">No featured candidates yet</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
                        {featured.map((cand: any) => (
                            <View key={cand.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mr-3 w-48">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <View className="w-9 h-9 rounded-full bg-ethiopia-gold/20 items-center justify-center">
                                        <Text className="text-ethiopia-gold text-sm font-bold">
                                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-xs font-bold" numberOfLines={1}>
                                            {cand.first_name} {cand.last_name}
                                        </Text>
                                        <Text className="text-ethiopia-gold text-[10px] font-semibold" numberOfLines={1}>
                                            {cand.category_name || 'Housemaid'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <Star size={10} color="#D4AF37" fill="#D4AF37" />
                                    <Text className="text-[10px] text-ethiopia-gold font-bold">Featured</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Gulf Countries */}
            <View className="px-5 mb-10">
                <Text className="text-white text-base font-extrabold mb-3">Recruitment Corridors</Text>
                <View className="flex-row flex-wrap gap-2">
                    {['🇦🇪 UAE', '🇸🇦 Saudi Arabia', '🇶🇦 Qatar', '🇰🇼 Kuwait', '🇴🇲 Oman'].map((country) => (
                        <View key={country} className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
                            <Text className="text-white text-xs font-semibold">{country}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

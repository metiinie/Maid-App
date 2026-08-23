import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, User, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ModeSelectScreen() {
    const { switchWorkspace, workspaces, activeWorkspace } = useAuth();
    const router = useRouter();

    const initialType = activeWorkspace?.type === 'GULF_EMPLOYER' ? 'GULF_EMPLOYER' : 'PERSONAL';
    const [selectedRole, setSelectedRole] = useState<'PERSONAL' | 'GULF_EMPLOYER'>(initialType);

    const handleContinue = async () => {
        const target = workspaces.find((w) => w.type === selectedRole) || workspaces[0];
        if (target) {
            await switchWorkspace(target.id);
        }
        router.replace('/(tabs)');
    };

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-6 py-12 max-w-md mx-auto w-full">
                {/* Brand Header */}
                <View className="items-center mb-8">
                    <View className="w-14 h-14 rounded-2xl bg-slate-900 items-center justify-center mb-4 shadow-sm">
                        <ShieldCheck size={28} color="#F59E0B" />
                    </View>

                    <View className="bg-amber-100 border border-amber-200 px-3.5 py-1 rounded-full mb-3 flex-row items-center gap-1.5">
                        <Sparkles size={12} color="#D97706" />
                        <Text className="text-amber-800 text-[10px] font-black tracking-widest uppercase">
                            ACCOUNT MODE
                        </Text>
                    </View>

                    <Text className="text-slate-900 text-2xl font-black text-center tracking-tight">
                        Choose Your Account Mode
                    </Text>
                    <Text className="text-slate-500 text-sm mt-1.5 text-center font-medium">
                        Select how you want to use the platform today
                    </Text>
                </View>

                {/* Option 1: Employer Mode */}
                <Pressable
                    onPress={() => setSelectedRole('GULF_EMPLOYER')}
                    className={`bg-white rounded-3xl p-5 mb-4 border transition-all shadow-sm active:scale-[0.99] ${selectedRole === 'GULF_EMPLOYER'
                        ? 'border-2 border-amber-500 bg-amber-50/40 shadow-md'
                        : 'border-slate-200'
                        }`}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${selectedRole === 'GULF_EMPLOYER' ? 'bg-amber-500' : 'bg-slate-100'
                            }`}>
                            <Building2 size={22} color={selectedRole === 'GULF_EMPLOYER' ? '#0F172A' : '#64748B'} />
                        </View>
                        <View className={`px-3 py-1 rounded-full ${selectedRole === 'GULF_EMPLOYER' ? 'bg-amber-500' : 'bg-slate-100'
                            }`}>
                            <Text className={`text-[10px] font-black uppercase ${selectedRole === 'GULF_EMPLOYER' ? 'text-slate-950' : 'text-slate-600'
                                }`}>
                                EMPLOYER
                            </Text>
                        </View>
                    </View>

                    <Text className="text-slate-900 text-lg font-black">Employer / Hirer</Text>
                    <Text className="text-slate-600 text-xs mt-1 leading-relaxed font-medium">
                        Hire verified Ethiopian domestic workers, drivers & chefs.
                    </Text>

                    <View className="flex-row items-center mt-3.5 gap-1.5">
                        <CheckCircle2 size={14} color="#D97706" />
                        <Text className="text-amber-800 text-xs font-bold">GAMCA Medical & Video Profiles</Text>
                    </View>
                </Pressable>

                {/* Option 2: Job Seeker / Candidate Mode */}
                <Pressable
                    onPress={() => setSelectedRole('PERSONAL')}
                    className={`bg-white rounded-3xl p-5 mb-8 border transition-all shadow-sm active:scale-[0.99] ${selectedRole === 'PERSONAL'
                        ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-md'
                        : 'border-slate-200'
                        }`}
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${selectedRole === 'PERSONAL' ? 'bg-emerald-600' : 'bg-slate-100'
                            }`}>
                            <User size={22} color={selectedRole === 'PERSONAL' ? '#FFFFFF' : '#64748B'} />
                        </View>
                        <View className={`px-3 py-1 rounded-full ${selectedRole === 'PERSONAL' ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}>
                            <Text className={`text-[10px] font-black uppercase ${selectedRole === 'PERSONAL' ? 'text-emerald-800' : 'text-slate-600'
                                }`}>
                                CANDIDATE
                            </Text>
                        </View>
                    </View>

                    <Text className="text-slate-900 text-lg font-black">Job Seeker</Text>
                    <Text className="text-slate-600 text-xs mt-1 leading-relaxed font-medium">
                        Find verified overseas jobs in Saudi Arabia, UAE, Qatar & Kuwait.
                    </Text>

                    <View className="flex-row items-center mt-3.5 gap-1.5">
                        <CheckCircle2 size={14} color="#059669" />
                        <Text className="text-emerald-800 text-xs font-bold">Verified Agencies & Free Visas</Text>
                    </View>
                </Pressable>

                {/* Continue CTA */}
                <Pressable
                    onPress={handleContinue}
                    className="bg-slate-900 py-4 rounded-full items-center flex-row justify-center gap-2 active:bg-slate-800 shadow-md"
                >
                    <Text className="text-amber-400 text-xs font-black uppercase tracking-wider">
                        Continue to Feed
                    </Text>
                    <ArrowRight size={16} color="#F59E0B" />
                </Pressable>
            </View>
        </ScrollView>
    );
}

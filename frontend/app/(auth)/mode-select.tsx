import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ModeSelectScreen() {
    const { activeWorkspace, switchWorkspace, workspaces } = useAuth();
    const router = useRouter();

    const selectRole = async (type: 'PERSONAL' | 'GULF_EMPLOYER' | 'AGENCY') => {
        const target = workspaces.find((w) => w.type === type) || workspaces[0];
        if (target) {
            await switchWorkspace(target.id);
        }
        if (type === 'AGENCY') {
            router.replace('/(admin)/dashboard');
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-5 py-10">
                {/* Header Badge */}
                <View className="items-center mb-8">
                    <View className="bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full mb-3">
                        <Text className="text-amber-400 text-xs font-black tracking-widest uppercase">
                            WELCOME TO ETHIO-GULF RECRUITMENT
                        </Text>
                    </View>
                    <Text className="text-white text-2xl font-black text-center">
                        Select Your Account Role
                    </Text>
                    <Text className="text-slate-400 text-xs mt-2 text-center font-semibold px-4">
                        Choose your primary intention to customize your dashboard feed
                    </Text>
                </View>

                {/* Option 1: Gulf Employer */}
                <Pressable
                    onPress={() => selectRole('GULF_EMPLOYER')}
                    className="bg-slate-800 border-2 border-amber-500/50 rounded-3xl p-5 mb-4 shadow-xl active:scale-[0.98]"
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="w-12 h-12 rounded-2xl bg-amber-500/20 items-center justify-center border border-amber-500/30">
                            <Building2 size={24} color="#F59E0B" />
                        </View>
                        <View className="bg-amber-500 px-3 py-1 rounded-full">
                            <Text className="text-slate-950 text-[10px] font-black uppercase">HIRING MANAGER</Text>
                        </View>
                    </View>
                    <Text className="text-white text-lg font-black">I am a Gulf Employer</Text>
                    <Text className="text-slate-300 text-xs mt-1 font-medium leading-5">
                        Browse verified Ethiopian domestic workers, drivers, chefs, and send direct agency recruitment inquiries.
                    </Text>
                    <View className="flex-row items-center mt-4 gap-2">
                        <CheckCircle2 size={14} color="#F59E0B" />
                        <Text className="text-amber-400 text-xs font-extrabold">GAMCA Medical Badges & Video Intros</Text>
                    </View>
                </Pressable>

                {/* Option 2: Job Seeker / Candidate */}
                <Pressable
                    onPress={() => selectRole('PERSONAL')}
                    className="bg-slate-800 border border-slate-700 rounded-3xl p-5 mb-4 shadow-xl active:scale-[0.98]"
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="w-12 h-12 rounded-2xl bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
                            <User size={24} color="#10B981" />
                        </View>
                        <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                            <Text className="text-emerald-400 text-[10px] font-black uppercase">JOB SEEKER</Text>
                        </View>
                    </View>
                    <Text className="text-white text-lg font-black">I am a Job Seeker</Text>
                    <Text className="text-slate-300 text-xs mt-1 font-medium leading-5">
                        Explore verified overseas job orders in Saudi Arabia, UAE, Qatar, and Kuwait with free visa inclusion.
                    </Text>
                    <View className="flex-row items-center mt-4 gap-2">
                        <CheckCircle2 size={14} color="#10B981" />
                        <Text className="text-emerald-400 text-xs font-extrabold">Transparent Salaries & Licensed Agencies</Text>
                    </View>
                </Pressable>

                {/* Option 3: Licensed Agency Admin */}
                <Pressable
                    onPress={() => selectRole('AGENCY')}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-5 mb-6 active:scale-[0.98]"
                >
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="w-12 h-12 rounded-2xl bg-blue-500/20 items-center justify-center border border-blue-500/30">
                            <ShieldCheck size={24} color="#60A5FA" />
                        </View>
                        <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                            <Text className="text-blue-400 text-[10px] font-black uppercase">RECRUITMENT AGENCY</Text>
                        </View>
                    </View>
                    <Text className="text-white text-base font-bold">Licensed Agency Admin</Text>
                    <Text className="text-slate-400 text-xs mt-1 font-medium">
                        Access Agency SaaS portal, 3-step candidate publishing wizard & 9-stage ATS pipeline.
                    </Text>
                </Pressable>

                {/* Skip / Continue */}
                <Pressable
                    onPress={() => router.replace('/(tabs)')}
                    className="bg-amber-500 py-4 rounded-full items-center flex-row justify-center gap-2 active:bg-amber-600 shadow-lg"
                >
                    <Text className="text-slate-950 text-sm font-black uppercase tracking-wider">
                        Continue to Dashboard
                    </Text>
                    <ArrowRight size={16} color="#0F172A" />
                </Pressable>
            </View>
        </ScrollView>
    );
}

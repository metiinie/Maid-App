import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, User, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function ModeSelectScreen() {
    const { switchWorkspace, workspaces } = useAuth();
    const router = useRouter();

    const selectRole = async (type: 'PERSONAL' | 'GULF_EMPLOYER') => {
        const target = workspaces.find((w) => w.type === type) || workspaces[0];
        if (target) {
            await switchWorkspace(target.id);
        }
        router.replace('/(tabs)');
    };

    return (
        <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-5 py-10">
                {/* Header */}
                <View className="items-center mb-8">
                    <View className="bg-amber-500/20 border border-amber-500/30 px-3.5 py-1 rounded-full mb-2.5">
                        <Text className="text-amber-400 text-[10px] font-black tracking-widest uppercase">
                            SELECT ROLE
                        </Text>
                    </View>
                    <Text className="text-white text-2xl font-black text-center">
                        Choose Your Account Mode
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1.5 text-center font-medium">
                        Select how you want to use the platform today
                    </Text>
                </View>

                {/* Option 1: Gulf Employer */}
                <Pressable
                    onPress={() => selectRole('GULF_EMPLOYER')}
                    className="bg-slate-800 border-2 border-amber-500/50 rounded-3xl p-5 mb-4 shadow-xl active:scale-[0.98]"
                >
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="w-11 h-11 rounded-2xl bg-amber-500/20 items-center justify-center border border-amber-500/30">
                            <Building2 size={22} color="#F59E0B" />
                        </View>
                        <View className="bg-amber-500 px-2.5 py-1 rounded-full">
                            <Text className="text-slate-950 text-[10px] font-black uppercase">EMPLOYER</Text>
                        </View>
                    </View>
                    <Text className="text-white text-base font-black">Employer / Hirer</Text>
                    <Text className="text-slate-300 text-xs mt-1 font-medium">
                        Hire verified Ethiopian domestic workers, drivers & chefs.
                    </Text>
                    <View className="flex-row items-center mt-3 gap-1.5">
                        <CheckCircle2 size={13} color="#F59E0B" />
                        <Text className="text-amber-400 text-[11px] font-extrabold">GAMCA Medical & Video Profiles</Text>
                    </View>
                </Pressable>

                {/* Option 2: Job Seeker / Candidate */}
                <Pressable
                    onPress={() => selectRole('PERSONAL')}
                    className="bg-slate-800 border border-slate-700 rounded-3xl p-5 mb-6 shadow-xl active:scale-[0.98]"
                >
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="w-11 h-11 rounded-2xl bg-emerald-500/20 items-center justify-center border border-emerald-500/30">
                            <User size={22} color="#10B981" />
                        </View>
                        <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full">
                            <Text className="text-emerald-400 text-[10px] font-black uppercase">CANDIDATE</Text>
                        </View>
                    </View>
                    <Text className="text-white text-base font-black">Job Seeker</Text>
                    <Text className="text-slate-300 text-xs mt-1 font-medium">
                        Find verified overseas jobs in Saudi Arabia, UAE, Qatar & Kuwait.
                    </Text>
                    <View className="flex-row items-center mt-3 gap-1.5">
                        <CheckCircle2 size={13} color="#10B981" />
                        <Text className="text-emerald-400 text-[11px] font-extrabold">Verified Agencies & Free Visas</Text>
                    </View>
                </Pressable>

                {/* Continue */}
                <Pressable
                    onPress={() => router.replace('/(tabs)')}
                    className="bg-amber-500 py-3.5 rounded-full items-center flex-row justify-center gap-2 active:bg-amber-600 shadow-lg"
                >
                    <Text className="text-slate-950 text-xs font-black uppercase tracking-wider">
                        Continue to Feed
                    </Text>
                    <ArrowRight size={15} color="#0F172A" />
                </Pressable>
            </View>
        </ScrollView>
    );
}

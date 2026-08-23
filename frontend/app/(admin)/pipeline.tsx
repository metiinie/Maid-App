import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, MapPin, ArrowRight, Clock, ShieldCheck, FileCheck, Award, Plane, Lock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminPipelineScreen() {
    const router = useRouter();
    const { admin } = useAuth();
    const [selectedStage, setSelectedStage] = useState<string>('APPLIED');

    if (!admin) {
        return (
            <View className="flex-1 bg-slate-950 items-center justify-center p-6">
                <View className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 items-center justify-center mb-4">
                    <Lock size={32} color="#F59E0B" />
                </View>
                <Text className="text-white text-xl font-black text-center mb-2">
                    ATS Pipeline Access Restricted
                </Text>
                <Text className="text-slate-400 text-xs text-center font-semibold leading-5 mb-6 px-4">
                    The 9-Stage ATS Government Compliance Board is restricted to licensed agency administrators.
                </Text>
                <Pressable
                    onPress={() => router.push('/(admin)/login')}
                    className="bg-amber-500 px-6 py-3.5 rounded-full items-center active:bg-amber-600 shadow-lg"
                >
                    <Text className="text-slate-950 text-xs font-black uppercase tracking-wider">
                        Sign In as Agency Admin
                    </Text>
                </Pressable>
                <Pressable onPress={() => router.replace('/(tabs)')} className="mt-4">
                    <Text className="text-slate-400 text-xs font-bold">← Back to Public Dashboard</Text>
                </Pressable>
            </View>
        );
    }

    const stages = [
        { key: 'APPLIED', label: '1. Applied', count: 5, icon: Award },
        { key: 'UNDER_REVIEW', label: '2. Under Review', count: 4, icon: ShieldCheck },
        { key: 'SHORTLISTED', label: '3. Shortlisted', count: 6, icon: FileCheck },
        { key: 'SENT_TO_EMPLOYER', label: '4. Sent to Employer', count: 3, icon: Clock },
        { key: 'EMPLOYER_REVIEW', label: '5. Employer Review', count: 4, icon: User },
        { key: 'INTERVIEW', label: '6. Interview', count: 2, icon: Clock },
        { key: 'SELECTED', label: '7. Selected', count: 5, icon: Award },
        { key: 'DOCUMENTATION', label: '8. Documentation & Visa', count: 7, icon: FileCheck },
        { key: 'DEPLOYED', label: '9. Deployed Overseas', count: 32, icon: Plane },
    ];

    const candidatePipelines = [
        {
            id: 'pipe-101',
            candidateCode: 'ET-8492',
            candidateName: 'Alem Tadesse',
            employerName: 'Al-Harbi Family',
            employerCountry: 'Saudi Arabia',
            employerCity: 'Riyadh',
            currentStage: 'UNDER_REVIEW',
            enteredStageDays: 5,
            molsaLicense: 'MOLSA-ETH-2024-089',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
        },
        {
            id: 'pipe-102',
            candidateCode: 'ET-8493',
            candidateName: 'Tigist Assefa',
            employerName: 'Al-Otaibi Family',
            employerCountry: 'Saudi Arabia',
            employerCity: 'Jeddah',
            currentStage: 'DOCUMENTATION',
            enteredStageDays: 12,
            molsaLicense: 'MOLSA-ETH-2024-089',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        },
        {
            id: 'pipe-103',
            candidateCode: 'ET-8494',
            candidateName: 'Genet Haile',
            employerName: 'Al-Sabah Household',
            employerCountry: 'Kuwait',
            employerCity: 'Kuwait City',
            currentStage: 'APPLIED',
            enteredStageDays: 2,
            molsaLicense: 'MOLSA-ETH-2024-089',
            photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200',
        },
    ];

    const filtered = candidatePipelines.filter(
        (p) => p.currentStage === selectedStage,
    );

    const handleAdvanceStage = (pipelineId: string) => {
        Alert.alert(
            'Advance Government Milestone',
            'Move candidate to the next legal recruitment stage in the MOLSA/GAMCA pipeline?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Advance Stage', onPress: () => Alert.alert('Milestone Updated', 'Candidate status updated in agency database.') },
            ],
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <ArrowLeft size={18} color="#0F172A" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-base font-extrabold text-slate-900">Government ATS Pipeline</Text>
                    <Text className="text-[10px] text-emerald-700 font-bold">9-Stage Legal Milestone Tracker</Text>
                </View>
                <View className="w-8" />
            </View>

            {/* Horizontal Stage Selector Tabs */}
            <View className="bg-white border-b border-slate-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-3 flex-row">
                    {stages.map((s) => (
                        <TouchableOpacity
                            key={s.key}
                            onPress={() => setSelectedStage(s.key)}
                            className={`px-3.5 py-2.5 rounded-xl mr-2 flex-row items-center border ${selectedStage === s.key
                                ? 'bg-emerald-600 border-emerald-700 shadow-xs'
                                : 'bg-slate-100 border-slate-200'
                                }`}
                        >
                            <s.icon size={14} color={selectedStage === s.key ? '#FFFFFF' : '#64748B'} className="mr-1.5" />
                            <Text className={`text-xs font-bold ${selectedStage === s.key ? 'text-white' : 'text-slate-700'}`}>
                                {s.label}
                            </Text>
                            <View className={`ml-2 px-1.5 py-0.5 rounded-full ${selectedStage === s.key ? 'bg-white/30' : 'bg-slate-200'}`}>
                                <Text className={`text-xs font-extrabold ${selectedStage === s.key ? 'text-white' : 'text-slate-700'}`}>
                                    {s.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Pipeline Candidate List */}
            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                {filtered.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                        <Clock size={36} color="#94A3B8" />
                        <Text className="text-sm font-bold text-slate-800 mt-2">No Candidates in this Stage</Text>
                        <Text className="text-xs text-slate-500 text-center mt-1 font-medium">
                            Select another stage tab above to view active recruitment pipelines.
                        </Text>
                    </View>
                ) : (
                    filtered.map((item) => (
                        <View key={item.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs">
                            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                                <View className="flex-row items-center flex-1">
                                    <Image source={{ uri: item.photoUrl }} className="w-12 h-12 rounded-xl mr-3 border border-slate-200" />
                                    <View>
                                        <View className="bg-blue-900 px-2 py-0.5 rounded-md self-start mb-0.5">
                                            <Text className="text-white text-[9px] font-extrabold">{item.candidateCode}</Text>
                                        </View>
                                        <Text className="text-sm font-bold text-slate-900">{item.candidateName}</Text>
                                    </View>
                                </View>
                                <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    <Text className="text-[10px] font-extrabold text-emerald-800">{item.enteredStageDays}d in stage</Text>
                                </View>
                            </View>

                            <View className="py-3 space-y-1">
                                <View className="flex-row items-center">
                                    <User size={14} color="#64748B" />
                                    <Text className="text-xs text-slate-700 ml-1.5 font-medium">Employer: {item.employerName}</Text>
                                </View>
                                <View className="flex-row items-center mt-1">
                                    <MapPin size={14} color="#059669" />
                                    <Text className="text-xs text-emerald-700 ml-1.5 font-bold">{item.employerCountry} ({item.employerCity})</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleAdvanceStage(item.id)}
                                className="bg-emerald-600 py-3 rounded-xl flex-row items-center justify-center mt-1 active:opacity-90 shadow-xs"
                            >
                                <Text className="text-white text-xs font-extrabold mr-1.5">Advance Milestone Stage</Text>
                                <ArrowRight size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

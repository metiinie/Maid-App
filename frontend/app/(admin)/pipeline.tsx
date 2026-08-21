import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, MapPin, ArrowRight, ShieldCheck, ChevronRight, FileText, CheckCircle2, Clock } from 'lucide-react-native';

export default function AdminPipelineScreen() {
    const router = useRouter();
    const [selectedStage, setSelectedStage] = useState<string>('INTERVIEWING');

    const stages = [
        { key: 'INTERVIEWING', label: '1. Interviewing', count: 4 },
        { key: 'MEDICAL_BIOMETRICS', label: '2. Medical & Biometrics', count: 6 },
        { key: 'VISA_PROCESSING', label: '3. Visa Processing', count: 8 },
        { key: 'PRE_DEPARTURE_TRAINING', label: '4. Pre-Departure', count: 3 },
        { key: 'DEPLOYED', label: '5. Deployed', count: 24 },
    ];

    const candidatePipelines = [
        {
            id: 'pipe-101',
            candidateName: 'Alem Tadesse',
            employerName: 'Al-Harbi Family',
            employerCountry: 'Saudi Arabia',
            employerCity: 'Riyadh',
            currentStage: 'MEDICAL_BIOMETRICS',
            enteredStageDays: 5,
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
        },
        {
            id: 'pipe-102',
            candidateName: 'Tigist Assefa',
            employerName: 'Al-Otaibi Family',
            employerCountry: 'Saudi Arabia',
            employerCity: 'Jeddah',
            currentStage: 'VISA_PROCESSING',
            enteredStageDays: 12,
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        },
    ];

    const filtered = candidatePipelines.filter(
        (p) => p.currentStage === selectedStage || selectedStage === 'ALL',
    );

    const handleAdvanceStage = (pipelineId: string) => {
        Alert.alert(
            'Advance Pipeline Stage',
            'Move candidate to the next stage in recruitment process?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Advance Stage', onPress: () => Alert.alert('Success', 'Candidate advanced to next stage') },
            ],
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-slate-100">
                    <ArrowLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">5-Stage Hiring Pipeline</Text>
                <View className="w-8" />
            </View>

            {/* Horizontal Stage Selector Tabs */}
            <View className="bg-white border-b border-slate-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2 flex-row">
                    {stages.map((s) => (
                        <TouchableOpacity
                            key={s.key}
                            onPress={() => setSelectedStage(s.key)}
                            className={`px-3.5 py-2 rounded-xl mr-2 flex-row items-center border ${selectedStage === s.key
                                    ? 'bg-emerald-500 border-emerald-500'
                                    : 'bg-slate-100 border-slate-200'
                                }`}
                        >
                            <Text
                                className={`text-xs font-bold ${selectedStage === s.key ? 'text-white' : 'text-slate-700'
                                    }`}
                            >
                                {s.label}
                            </Text>
                            <View
                                className={`ml-2 px-1.5 py-0.5 rounded-full ${selectedStage === s.key ? 'bg-white/30' : 'bg-slate-200'
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-extrabold ${selectedStage === s.key ? 'text-white' : 'text-slate-700'
                                        }`}
                                >
                                    {s.count}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Pipeline Candidate List */}
            <ScrollView className="flex-1 p-4">
                {filtered.length === 0 ? (
                    <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4">
                        <Clock size={36} color="#94A3B8" />
                        <Text className="text-sm font-bold text-slate-700 mt-2">No Candidates in this Stage</Text>
                        <Text className="text-xs text-slate-400 text-center mt-1">
                            Select another stage tab above to view active recruitment pipelines.
                        </Text>
                    </View>
                ) : (
                    filtered.map((item) => (
                        <View key={item.id} className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs">
                            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                                <View className="flex-row items-center flex-1">
                                    <Image source={{ uri: item.photoUrl }} className="w-12 h-12 rounded-full mr-3 border border-slate-200" />
                                    <View>
                                        <Text className="text-base font-bold text-slate-900">{item.candidateName}</Text>
                                        <Text className="text-xs text-slate-500">Ref #{item.id}</Text>
                                    </View>
                                </View>
                                <View className="bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                                    <Text className="text-xs font-bold text-amber-800">{item.enteredStageDays}d in stage</Text>
                                </View>
                            </View>

                            <View className="py-3 space-y-1">
                                <View className="flex-row items-center">
                                    <User size={14} color="#64748B" />
                                    <Text className="text-xs text-slate-600 ml-1.5 font-medium">Employer: {item.employerName}</Text>
                                </View>
                                <View className="flex-row items-center mt-1">
                                    <MapPin size={14} color="#10B981" />
                                    <Text className="text-xs text-emerald-600 ml-1.5 font-bold">{item.employerCountry} ({item.employerCity})</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleAdvanceStage(item.id)}
                                className="bg-emerald-500 py-2.5 rounded-xl flex-row items-center justify-center mt-1"
                            >
                                <Text className="text-white text-xs font-bold mr-1.5">Advance Stage</Text>
                                <ArrowRight size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

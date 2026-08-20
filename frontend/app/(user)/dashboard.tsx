import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, MessageSquare, ArrowLeft, Clock } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { vacancyService } from '../../services/vacancyService';
import { pipelineService } from '../../services/pipelineService';

const stages = [
    { key: 'interviewing', label: 'Interview' },
    { key: 'medical_biometrics', label: 'Medical' },
    { key: 'visa_processing', label: 'Visa' },
    { key: 'pre_departure_training', label: 'Training' },
    { key: 'deployed', label: 'Deployed' },
];

export default function UserDashboard() {
    const { user, logoutUser } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'applications' | 'pipelines'>('applications');
    const [applications, setApplications] = useState<any[]>([]);
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [appRes, pipeRes]: any = await Promise.all([
                    vacancyService.getUserApplications(),
                    pipelineService.getUserPipelines(),
                ]);
                setApplications(appRes.data || []);
                setPipelines(pipeRes.data || []);
            } catch { }
            setLoading(false);
        }
        load();
    }, []);

    return (
        <View className="flex-1 bg-ethiopia-navy">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-1.5">
                    <ArrowLeft size={20} color="#D4AF37" />
                </Pressable>
                <Text className="text-white text-lg font-extrabold flex-1 ml-3">My Dashboard</Text>
                <Pressable
                    onPress={async () => { await logoutUser(); router.replace('/'); }}
                    className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
                >
                    <Text className="text-slate-300 text-[10px] font-bold">Sign Out</Text>
                </Pressable>
            </View>

            {/* User Info */}
            <View className="px-5 mb-4">
                <View className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <Text className="text-ethiopia-gold text-[10px] font-extrabold uppercase tracking-wider">User Portal</Text>
                    <Text className="text-white text-base font-extrabold mt-1">{user?.first_name} {user?.last_name}</Text>
                    <Text className="text-slate-400 text-[11px]">Phone: {user?.phone} • Role: {user?.role}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="px-5 mb-4">
                <View className="flex-row bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <Pressable
                        onPress={() => setActiveTab('applications')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'applications' ? 'bg-ethiopia-gold' : ''}`}
                    >
                        <Text className={`text-[11px] font-bold ${activeTab === 'applications' ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                            Applications ({applications.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('pipelines')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'pipelines' ? 'bg-ethiopia-gold' : ''}`}
                    >
                        <Text className={`text-[11px] font-bold ${activeTab === 'pipelines' ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                            Pipelines ({pipelines.length})
                        </Text>
                    </Pressable>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#D4AF37" size="large" className="mt-10" />
            ) : activeTab === 'applications' ? (
                <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                    {applications.length === 0 ? (
                        <View className="items-center py-16">
                            <Briefcase size={28} color="#475569" />
                            <Text className="text-slate-400 text-xs mt-3">No applications yet</Text>
                        </View>
                    ) : (
                        applications.map((app: any) => (
                            <View key={app.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-3">
                                <Text className="text-white text-sm font-bold">{app.vacancy_title}</Text>
                                <Text className="text-ethiopia-gold text-[11px] font-semibold mt-0.5">
                                    Agency: {app.agency_name}
                                </Text>
                                <View className="flex-row items-center justify-between mt-2.5">
                                    <View className="flex-row items-center gap-1">
                                        <Clock size={10} color="#64748B" />
                                        <Text className="text-slate-400 text-[10px]">
                                            Applied {new Date(app.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-full ${app.status === 'selected' ? 'bg-emerald-500/15 border border-emerald-500/25' :
                                            app.status === 'rejected' ? 'bg-red-500/15 border border-red-500/25' :
                                                'bg-ethiopia-gold/15 border border-ethiopia-gold/25'
                                        }`}>
                                        <Text className={`text-[9px] font-extrabold uppercase ${app.status === 'selected' ? 'text-emerald-400' :
                                                app.status === 'rejected' ? 'text-red-400' :
                                                    'text-ethiopia-gold'
                                            }`}>{app.status}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            ) : (
                <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                    {pipelines.length === 0 ? (
                        <View className="items-center py-16">
                            <MessageSquare size={28} color="#475569" />
                            <Text className="text-slate-400 text-xs mt-3">No active pipelines</Text>
                        </View>
                    ) : (
                        pipelines.map((pipe: any) => (
                            <View key={pipe.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-3">
                                <Text className="text-ethiopia-gold text-[10px] font-bold uppercase">
                                    Pipeline #{pipe.id?.substring(0, 8)}
                                </Text>
                                <Text className="text-white text-sm font-extrabold mt-1">
                                    {pipe.candidate_name || 'Candidate'}
                                </Text>
                                <Text className="text-slate-400 text-[11px]">
                                    Employer: {pipe.employer_name} • {pipe.outcome || 'in_progress'}
                                </Text>

                                {/* Stage Stepper */}
                                <View className="flex-row gap-1.5 mt-3">
                                    {stages.map((stg, idx) => {
                                        const isCurrent = pipe.current_stage === stg.key;
                                        return (
                                            <View
                                                key={stg.key}
                                                className={`flex-1 p-2 rounded-lg items-center ${isCurrent ? 'bg-ethiopia-gold' : 'bg-slate-950 border border-slate-800'
                                                    }`}
                                            >
                                                <Text className={`text-[7px] font-bold ${isCurrent ? 'text-ethiopia-navy' : 'text-slate-500'}`}>
                                                    {idx + 1}
                                                </Text>
                                                <Text
                                                    className={`text-[7px] font-bold mt-0.5 ${isCurrent ? 'text-ethiopia-navy' : 'text-slate-500'}`}
                                                    numberOfLines={1}
                                                >
                                                    {stg.label}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}

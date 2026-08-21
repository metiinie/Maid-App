import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, MessageSquare, ArrowLeft, Clock, User, ShieldCheck, LogOut } from 'lucide-react-native';
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
        <View className="flex-1 bg-slate-50">
            {/* Navigation Header */}
            <View className="bg-blue-900 px-5 pt-14 pb-4 flex-row items-center justify-between shadow-md">
                <View className="flex-row items-center gap-3">
                    <Pressable onPress={() => router.back()} className="p-1 rounded-full bg-blue-800">
                        <ArrowLeft size={20} color="#FFFFFF" />
                    </Pressable>
                    <View className="w-8 h-8 rounded-lg bg-emerald-500 items-center justify-center">
                        <User size={18} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text className="text-white text-base font-bold">User Portal</Text>
                        <Text className="text-emerald-300 text-[10px] font-semibold">Job Seeker / Candidate View</Text>
                    </View>
                </View>

                <Pressable
                    onPress={async () => { await logoutUser(); router.replace('/'); }}
                    className="bg-blue-950 border border-blue-800 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
                >
                    <LogOut size={12} color="#94A3B8" />
                    <Text className="text-white text-[11px] font-bold">Sign Out</Text>
                </Pressable>
            </View>

            {/* User Info Card */}
            <View className="px-5 pt-4 mb-2">
                <View className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <Text className="text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">Candidate Profile</Text>
                    <Text className="text-slate-900 text-base font-extrabold mt-0.5">{user?.first_name || 'Alem'} {user?.last_name || 'Tadesse'}</Text>
                    <Text className="text-slate-600 text-xs mt-0.5">Phone: {user?.phone || '+251911000000'} • Role: {user?.role || 'Job Seeker'}</Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="px-5 my-3">
                <View className="flex-row bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
                    <Pressable
                        onPress={() => setActiveTab('applications')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'applications' ? 'bg-emerald-600' : 'bg-transparent'}`}
                    >
                        <Text className={`text-xs font-bold ${activeTab === 'applications' ? 'text-white' : 'text-slate-700'}`}>
                            My Applications ({applications.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('pipelines')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${activeTab === 'pipelines' ? 'bg-emerald-600' : 'bg-transparent'}`}
                    >
                        <Text className={`text-xs font-bold ${activeTab === 'pipelines' ? 'text-white' : 'text-slate-700'}`}>
                            Process Pipeline ({pipelines.length})
                        </Text>
                    </Pressable>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : activeTab === 'applications' ? (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {applications.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-2 shadow-xs">
                            <Briefcase size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No Active Applications</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">Browse available vacancies and submit your profile to recruitment agencies.</Text>
                        </View>
                    ) : (
                        applications.map((app: any) => (
                            <View key={app.id} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs">
                                <Text className="text-slate-900 text-sm font-bold">{app.vacancy_title}</Text>
                                <Text className="text-emerald-700 text-xs font-semibold mt-0.5">
                                    Agency: {app.agency_name}
                                </Text>
                                <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-slate-100">
                                    <View className="flex-row items-center gap-1">
                                        <Clock size={12} color="#64748B" />
                                        <Text className="text-slate-500 text-xs font-medium">
                                            Applied {new Date(app.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${app.status === 'selected' ? 'bg-emerald-100' :
                                            app.status === 'rejected' ? 'bg-red-100' :
                                                'bg-blue-100'
                                        }`}>
                                        <Text className={`text-xs font-extrabold uppercase ${app.status === 'selected' ? 'text-emerald-800' :
                                                app.status === 'rejected' ? 'text-red-800' :
                                                    'text-blue-900'
                                            }`}>{app.status}</Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            ) : (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {pipelines.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-2 shadow-xs">
                            <MessageSquare size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No Active Recruitment Process</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">Once selected by an agency, your medical, visa, and training stages will be tracked here.</Text>
                        </View>
                    ) : (
                        pipelines.map((pipe: any) => (
                            <View key={pipe.id} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs">
                                <Text className="text-emerald-700 text-xs font-bold uppercase">
                                    Pipeline #{pipe.id?.substring(0, 8)}
                                </Text>
                                <Text className="text-slate-900 text-sm font-extrabold mt-1">
                                    {pipe.candidate_name || 'Candidate Profile'}
                                </Text>
                                <Text className="text-slate-600 text-xs mt-0.5">
                                    Employer: {pipe.employer_name} • {pipe.outcome || 'In Progress'}
                                </Text>

                                {/* Stage Stepper */}
                                <View className="flex-row gap-1.5 mt-3">
                                    {stages.map((stg, idx) => {
                                        const isCurrent = pipe.current_stage === stg.key;
                                        return (
                                            <View
                                                key={stg.key}
                                                className={`flex-1 p-2 rounded-lg items-center ${isCurrent ? 'bg-emerald-600' : 'bg-slate-100 border border-slate-200'
                                                    }`}
                                            >
                                                <Text className={`text-[9px] font-bold ${isCurrent ? 'text-white' : 'text-slate-600'}`}>
                                                    {idx + 1}
                                                </Text>
                                                <Text
                                                    className={`text-[8px] font-bold mt-0.5 ${isCurrent ? 'text-white' : 'text-slate-600'}`}
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

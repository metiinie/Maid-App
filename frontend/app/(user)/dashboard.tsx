import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, MessageSquare, ArrowLeft, Clock, User, ShieldCheck, LogOut, CheckCircle2, Award, FileText } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { vacancyService } from '../../services/vacancyService';
import { pipelineService } from '../../services/pipelineService';
import { PremiumHeader } from '../../components/PremiumHeader';

const stages = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'UNDER_REVIEW', label: 'Review' },
    { key: 'SHORTLISTED', label: 'Shortlist' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'SELECTED', label: 'Selected' },
    { key: 'DOCUMENTATION', label: 'Visa Docs' },
    { key: 'DEPLOYED', label: 'Deployed' },
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
            {/* Premium Header */}
            <PremiumHeader subtitle="Personal Candidate Profile & Application Hub" />

            {/* Candidate Identity Card */}
            <View className="px-5 pt-4 mb-2">
                <View className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1 mr-3">
                            <View className="w-12 h-12 rounded-2xl bg-emerald-100 items-center justify-center mr-3 border border-emerald-200 shadow-xs">
                                <Text className="text-emerald-900 text-lg font-black">
                                    {user?.first_name?.[0] || 'A'}{user?.last_name?.[0] || 'T'}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-slate-900 text-base font-extrabold mr-2">
                                        {user?.first_name || 'Alem'} {user?.last_name || 'Tadesse'}
                                    </Text>
                                    <CheckCircle2 size={16} color="#059669" />
                                </View>
                                <Text className="text-slate-500 text-xs mt-0.5 font-semibold">
                                    {user?.phone || '+251 911 000 000'} • Housemaid Candidate
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={async () => { await logoutUser(); router.replace('/'); }}
                            className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl"
                        >
                            <LogOut size={16} color="#64748B" />
                        </Pressable>
                    </View>

                    {/* CV Profile Health Meter */}
                    <View className="mt-4 pt-3 border-t border-slate-100 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <ShieldCheck size={16} color="#059669" />
                            <Text className="text-slate-700 text-xs font-bold">Medical Clearance Verified</Text>
                        </View>
                        <View className="bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            <Text className="text-emerald-800 text-[10px] font-black">95% Profile Strength</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Segmented Tab Switcher */}
            <View className="px-5 my-3">
                <View className="flex-row bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                    <Pressable
                        onPress={() => setActiveTab('applications')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'applications' ? 'bg-emerald-600 shadow-xs' : 'bg-transparent'}`}
                    >
                        <Text className={`text-xs font-extrabold ${activeTab === 'applications' ? 'text-white' : 'text-slate-700'}`}>
                            Applications ({applications.length})
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('pipelines')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'pipelines' ? 'bg-emerald-600 shadow-xs' : 'bg-transparent'}`}
                    >
                        <Text className={`text-xs font-extrabold ${activeTab === 'pipelines' ? 'text-white' : 'text-slate-700'}`}>
                            ATS Trackers ({pipelines.length})
                        </Text>
                    </Pressable>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : activeTab === 'applications' ? (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {applications.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-2 shadow-xs">
                            <Briefcase size={36} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-extrabold mt-3">No Active Applications</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                                Browse available overseas jobs in Saudi Arabia, UAE, Qatar & Kuwait and submit your candidate CV.
                            </Text>
                        </View>
                    ) : (
                        applications.map((app: any) => (
                            <View key={app.id} className="bg-white border border-slate-200 rounded-3xl p-5 mb-3 shadow-xs">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-slate-900 text-sm font-extrabold">{app.vacancy_title}</Text>
                                    <View className={`px-3 py-1 rounded-full ${app.status === 'selected' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                                        <Text className="text-[10px] font-black uppercase text-emerald-800">{app.status}</Text>
                                    </View>
                                </View>
                                <Text className="text-emerald-700 text-xs font-bold mt-0.5">
                                    Agency: {app.agency_name}
                                </Text>
                                <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                    <View className="flex-row items-center gap-1.5">
                                        <Clock size={12} color="#64748B" />
                                        <Text className="text-slate-500 text-[11px] font-medium">
                                            Submitted {new Date(app.created_at || Date.now()).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text className="text-blue-900 text-xs font-bold">View Status →</Text>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            ) : (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {pipelines.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-2 shadow-xs">
                            <FileText size={36} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-extrabold mt-3">No Active Deployment Pipeline</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                                Once shortlisted by a Gulf employer, your 9-stage legal recruitment milestone status will update here in real time.
                            </Text>
                        </View>
                    ) : (
                        pipelines.map((pipe: any) => (
                            <View key={pipe.id} className="bg-white border border-slate-200 rounded-3xl p-5 mb-3 shadow-xs">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-emerald-700 text-xs font-black uppercase">
                                        Pipeline #{pipe.id?.substring(0, 8)}
                                    </Text>
                                    <Text className="text-slate-900 text-xs font-bold">{pipe.employer_name}</Text>
                                </View>
                                <Text className="text-slate-900 text-sm font-black mt-1">
                                    {pipe.candidate_name || 'Candidate Profile'}
                                </Text>

                                {/* 9-Stage Milestone Tracker Progress Bar */}
                                <View className="mt-4">
                                    <Text className="text-slate-500 text-[10px] font-extrabold uppercase mb-2">Stage Progression</Text>
                                    <View className="flex-row gap-1">
                                        {stages.map((stg) => {
                                            const isCurrent = pipe.current_stage === stg.key;
                                            return (
                                                <View
                                                    key={stg.key}
                                                    className={`flex-1 h-2 rounded-full ${isCurrent ? 'bg-emerald-600' : 'bg-slate-200'}`}
                                                />
                                            );
                                        })}
                                    </View>
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


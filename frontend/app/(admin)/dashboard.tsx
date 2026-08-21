import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    ShieldCheck,
    Plus,
    ArrowLeft,
    X,
    LogOut,
    GitPullRequest,
    Users,
    Briefcase,
    CreditCard,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { pipelineService } from '../../services/pipelineService';
import { subscriptionService } from '../../services/subscriptionService';

const stageFlow = [
    { from: 'interviewing', to: 'medical_biometrics', label: 'Medical & Biometrics' },
    { from: 'medical_biometrics', to: 'visa_processing', label: 'Visa Processing' },
    { from: 'visa_processing', to: 'pre_departure_training', label: 'Pre-Departure Training' },
    { from: 'pre_departure_training', to: 'deployed', label: 'Deployed' },
];

export default function AdminDashboard() {
    const { admin, logoutAdmin } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('candidates');
    const [candidates, setCandidates] = useState<any[]>([]);
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [addCandModal, setAddCandModal] = useState(false);
    const [newCand, setNewCand] = useState({ first_name: '', last_name: '', passport_number: '' });

    async function loadData() {
        setLoading(true);
        try {
            const [cRes, vRes, pRes, sRes, plRes]: any = await Promise.all([
                candidateService.getAdminCandidates(),
                vacancyService.getAdminVacancies(),
                pipelineService.getAdminPipelines(),
                subscriptionService.getAgencySubscription(),
                subscriptionService.getSubscriptionPlans(),
            ]);
            setCandidates(cRes.data || []);
            setVacancies(vRes.data || []);
            setPipelines(pRes.data || []);
            setSubscription(sRes.data || null);
            setPlans(plRes.data || []);
        } catch (e) { }
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function addCandidate() {
        if (!newCand.first_name || !newCand.last_name) return;
        try {
            const fd = new FormData();
            Object.entries(newCand).forEach(([k, v]) => fd.append(k, v));
            await candidateService.createAdminCandidate(fd);
            setAddCandModal(false);
            setNewCand({ first_name: '', last_name: '', passport_number: '' });
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    }

    async function advanceStage(pipelineId: string, nextStage: string) {
        try {
            await pipelineService.advancePipelineStage(pipelineId, {
                next_stage: nextStage,
                notes: `Advanced to ${nextStage}`,
            });
            loadData();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    }

    async function checkout(planId: string) {
        try {
            const res: any = await subscriptionService.initializeCheckout(planId, 'chapa');
            Alert.alert(
                'Checkout',
                `Transaction Ref: ${res.data?.tx_ref}\nVerify after payment via Chapa.`,
            );
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    }

    const tabs = [
        { key: 'candidates', label: `Candidates (${candidates.length})` },
        { key: 'vacancies', label: `Jobs (${vacancies.length})` },
        { key: 'pipelines', label: `Pipelines (${pipelines.length})` },
        { key: 'billing', label: 'Billing' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Navigation Header */}
            <View className="bg-blue-900 px-5 pt-14 pb-4 flex-row items-center justify-between shadow-md">
                <View className="flex-row items-center gap-3">
                    <Pressable onPress={() => router.back()} className="p-1 rounded-full bg-blue-800">
                        <ArrowLeft size={20} color="#FFFFFF" />
                    </Pressable>
                    <View className="w-8 h-8 rounded-lg bg-emerald-500 items-center justify-center">
                        <ShieldCheck size={18} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text className="text-white text-base font-bold">Admin Portal</Text>
                        <Text className="text-emerald-300 text-[10px] font-semibold">
                            {admin?.agency_name || 'Addis Recruitment Agency'}
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={async () => {
                        await logoutAdmin();
                        router.replace('/');
                    }}
                    className="bg-blue-950 border border-blue-800 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5"
                >
                    <LogOut size={12} color="#94A3B8" />
                    <Text className="text-white text-[11px] font-bold">Sign Out</Text>
                </Pressable>
            </View>

            {/* Quick Action Bar for Pipeline */}
            <View className="px-5 pt-3">
                <Pressable
                    onPress={() => router.push('/(admin)/pipeline')}
                    className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex-row items-center justify-between active:opacity-90 shadow-xs"
                >
                    <View className="flex-row items-center gap-2">
                        <GitPullRequest size={18} color="#1E3A8A" />
                        <View>
                            <Text className="text-blue-950 text-xs font-extrabold">Open 5-Stage Kanban Board</Text>
                            <Text className="text-blue-700 text-[10px]">Track candidate clearance & visa advancement</Text>
                        </View>
                    </View>
                    <View className="bg-blue-900 px-2.5 py-1 rounded-lg">
                        <Text className="text-white text-[10px] font-extrabold">Open Pipeline →</Text>
                    </View>
                </Pressable>
            </View>

            {/* Stats Row */}
            <View className="px-5 pt-3 flex-row gap-3">
                {[
                    { v: candidates.length, l: 'Candidates', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                    { v: vacancies.length, l: 'Vacancies', color: 'text-blue-900', bg: 'bg-blue-50' },
                    { v: pipelines.length, l: 'Pipelines', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                ].map((s) => (
                    <View
                        key={s.l}
                        className="flex-1 bg-white border border-slate-200 p-3 rounded-xl items-center shadow-xs"
                    >
                        <Text className={`text-xl font-extrabold ${s.color}`}>{s.v}</Text>
                        <Text className="text-slate-600 text-[10px] font-bold">{s.l}</Text>
                    </View>
                ))}
            </View>

            {/* Segmented Tab Bar */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-5 my-3"
                contentContainerStyle={{ gap: 8 }}
            >
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl border ${isActive
                                    ? 'bg-emerald-600 border-emerald-600'
                                    : 'bg-white border-slate-200'
                                }`}
                        >
                            <Text
                                className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-slate-800'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* Main Content Area */}
            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {activeTab === 'candidates' && (
                        <View>
                            <Pressable
                                onPress={() => setAddCandModal(true)}
                                className="bg-emerald-600 py-3 rounded-xl items-center flex-row justify-center gap-2 mb-4 shadow-xs active:opacity-90"
                            >
                                <Plus size={16} color="#FFFFFF" />
                                <Text className="text-white text-xs font-extrabold">Add New Candidate</Text>
                            </Pressable>

                            {candidates.map((c: any) => (
                                <View
                                    key={c.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-xs"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-slate-900 text-sm font-bold">
                                            {c.first_name} {c.last_name}
                                        </Text>
                                        <View
                                            className={`px-2.5 py-0.5 rounded-full ${c.medical_status === 'cleared'
                                                    ? 'bg-emerald-100 border border-emerald-200'
                                                    : 'bg-slate-100 border border-slate-200'
                                                }`}
                                        >
                                            <Text
                                                className={`text-[10px] font-bold ${c.medical_status === 'cleared'
                                                        ? 'text-emerald-800'
                                                        : 'text-slate-700'
                                                    }`}
                                            >
                                                {c.medical_status}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-blue-900 text-xs font-semibold mt-1">
                                        {c.category_name || 'Domestic Worker'}
                                    </Text>
                                    <Text className="text-slate-500 text-[11px] mt-1 font-medium">
                                        Passport: {c.passport_number || 'Pending'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'vacancies' && (
                        <View>
                            {vacancies.map((v: any) => (
                                <View
                                    key={v.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-xs"
                                >
                                    <Text className="text-slate-900 text-sm font-bold">{v.title}</Text>
                                    <Text className="text-emerald-700 text-xs font-bold mt-1">
                                        {v.target_country} • ${v.salary_monthly} USD/mo
                                    </Text>
                                    <Text className="text-slate-500 text-[11px] mt-1 font-medium">
                                        Applications: {v.applications_count || 0}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'pipelines' && (
                        <View>
                            {pipelines.map((p: any) => (
                                <View
                                    key={p.id}
                                    className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-xs"
                                >
                                    <Text className="text-slate-900 text-sm font-bold">
                                        {p.candidate_name || 'Candidate Profile'}
                                    </Text>
                                    <Text className="text-slate-700 text-xs mt-1">
                                        Employer: {p.employer_name} • Stage:{' '}
                                        <Text className="text-blue-900 font-bold">
                                            {p.current_stage?.replace('_', ' ')}
                                        </Text>
                                    </Text>
                                    {stageFlow
                                        .filter((s) => s.from === p.current_stage)
                                        .map((s) => (
                                            <Pressable
                                                key={s.to}
                                                onPress={() => advanceStage(p.id, s.to)}
                                                className="mt-3 bg-blue-900 py-2.5 rounded-lg items-center active:opacity-90"
                                            >
                                                <Text className="text-white text-xs font-bold">
                                                    Advance → {s.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'billing' && (
                        <View>
                            <Text className="text-slate-900 text-sm font-bold mb-3">
                                Agency Subscription Plans
                            </Text>
                            {plans.map((plan: any) => (
                                <View
                                    key={plan.id}
                                    className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-xs"
                                >
                                    <Text className="text-emerald-700 text-xs font-extrabold uppercase tracking-wider">
                                        {plan.code}
                                    </Text>
                                    <Text className="text-slate-900 text-base font-bold mt-1">
                                        {plan.name}
                                    </Text>
                                    <Text className="text-slate-900 text-xl font-black mt-1">
                                        {plan.price_etb}{' '}
                                        <Text className="text-xs text-slate-500 font-normal">ETB/mo</Text>
                                    </Text>
                                    <Pressable
                                        onPress={() => checkout(plan.id)}
                                        className="mt-4 bg-emerald-600 py-3 rounded-lg items-center active:opacity-90"
                                    >
                                        <Text className="text-white text-xs font-bold">Checkout with Chapa</Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* Add Candidate Modal */}
            <Modal visible={addCandModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-center items-center p-5">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm border border-slate-200 shadow-xl">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-slate-900 text-base font-bold">Add Candidate</Text>
                            <Pressable onPress={() => setAddCandModal(false)}>
                                <X size={20} color="#64748B" />
                            </Pressable>
                        </View>
                        <View className="gap-3">
                            <TextInput
                                value={newCand.first_name}
                                onChangeText={(v) => setNewCand({ ...newCand, first_name: v })}
                                placeholder="First Name *"
                                placeholderTextColor="#94A3B8"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 text-xs"
                            />
                            <TextInput
                                value={newCand.last_name}
                                onChangeText={(v) => setNewCand({ ...newCand, last_name: v })}
                                placeholder="Last Name *"
                                placeholderTextColor="#94A3B8"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 text-xs"
                            />
                            <TextInput
                                value={newCand.passport_number}
                                onChangeText={(v) => setNewCand({ ...newCand, passport_number: v })}
                                placeholder="Passport Number *"
                                placeholderTextColor="#94A3B8"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-900 text-xs"
                            />
                            <Pressable
                                onPress={addCandidate}
                                className="bg-emerald-600 py-3 rounded-lg items-center mt-2 active:opacity-90"
                            >
                                <Text className="text-white text-xs font-bold">Save Candidate</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

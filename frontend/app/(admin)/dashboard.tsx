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
    Building2,
    Check,
    Video,
    Bell,
    Lock,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { pipelineService } from '../../services/pipelineService';
import { subscriptionService } from '../../services/subscriptionService';
import { StatCard } from '../../components/StatCard';

const stageFlow = [
    { from: 'APPLIED', to: 'UNDER_REVIEW', label: 'Move to Review' },
    { from: 'UNDER_REVIEW', to: 'SHORTLISTED', label: 'Shortlist Candidate' },
    { from: 'SHORTLISTED', to: 'SENT_TO_EMPLOYER', label: 'Send to Employer' },
    { from: 'SENT_TO_EMPLOYER', to: 'EMPLOYER_REVIEW', label: 'Employer Review' },
    { from: 'EMPLOYER_REVIEW', to: 'INTERVIEW', label: 'Schedule Interview' },
    { from: 'INTERVIEW', to: 'SELECTED', label: 'Mark Selected' },
    { key: 'SELECTED', to: 'DOCUMENTATION', label: 'Process Visa Docs' },
    { from: 'DOCUMENTATION', to: 'DEPLOYED', label: 'Confirm Flight & Deploy' },
];

export default function AdminDashboard() {
    const { admin, logoutAdmin, activeWorkspace } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('candidates');
    const [candidates, setCandidates] = useState<any[]>([]);
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 3-Step Wizard Modal State
    const [addCandModal, setAddCandModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [newCand, setNewCand] = useState({
        first_name: '',
        last_name: '',
        age: '25',
        skill_category: 'Domestic Worker',
        experience_years: '3',
        medical_status: 'Cleared',
        passport_status: 'Valid',
        passport_number: '',
        notes: '',
    });

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

    async function submitCandidateWizard() {
        if (!newCand.first_name || !newCand.last_name) {
            Alert.alert('Required', 'First and Last Name are required.');
            return;
        }
        try {
            const fd = new FormData();
            Object.entries(newCand).forEach(([k, v]) => fd.append(k, v));
            await candidateService.createAdminCandidate(fd);
            setAddCandModal(false);
            setWizardStep(1);
            setNewCand({
                first_name: '',
                last_name: '',
                age: '25',
                skill_category: 'Domestic Worker',
                experience_years: '3',
                medical_status: 'Cleared',
                passport_status: 'Valid',
                passport_number: '',
                notes: '',
            });
            loadData();
            Alert.alert('Success', 'Candidate published to agency roster!');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save candidate.');
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

    if (!admin) {
        return (
            <View className="flex-1 bg-slate-950 items-center justify-center p-6">
                <View className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 items-center justify-center mb-4">
                    <Lock size={32} color="#F59E0B" />
                </View>
                <Text className="text-white text-xl font-black text-center mb-2">
                    Agency Admin Access Restricted
                </Text>
                <Text className="text-slate-400 text-xs text-center font-semibold leading-5 mb-6 px-4">
                    The Agency Admin Portal, 3-Step Candidate Wizard, and ATS Pipeline are restricted to licensed agency administrators.
                </Text>
                <Pressable
                    onPress={() => router.push('/(auth)/login')}
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

    return (
        <View className="flex-1 bg-slate-50">
            {/* Deep Navy Admin Header (#0F172A) */}
            <View className="bg-slate-900 px-5 pt-14 pb-5 shadow-md">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                        <Pressable onPress={() => router.back()} className="mr-3 p-1">
                            <ArrowLeft size={20} color="#FFFFFF" />
                        </Pressable>
                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-white text-lg font-black tracking-wide">
                                    Agency Admin Portal
                                </Text>
                                <View className="bg-amber-500 px-2 py-0.5 rounded-full">
                                    <Text className="text-slate-950 text-[10px] font-black uppercase">
                                        LICENSED
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-amber-400 text-xs font-semibold mt-0.5">
                                {activeWorkspace?.name || 'Licensed Ethiopian Manpower Agency'}
                            </Text>
                        </View>
                    </View>

                    <Pressable onPress={() => logoutAdmin()} className="p-2 rounded-full bg-slate-800">
                        <LogOut size={18} color="#F59E0B" />
                    </Pressable>
                </View>
            </View>

            {/* ATS Kanban Quick Banner */}
            <View className="px-5 pt-4">
                <Pressable
                    onPress={() => router.push('/(admin)/pipeline')}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex-row items-center justify-between shadow-xs active:opacity-90"
                >
                    <View className="flex-row items-center gap-3 flex-1 mr-2">
                        <View className="w-10 h-10 rounded-2xl bg-amber-500 items-center justify-center">
                            <GitPullRequest size={20} color="#0F172A" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white text-xs font-extrabold">Open 9-Stage ATS Kanban Board</Text>
                            <Text className="text-amber-300 text-[10px] font-semibold">Track GAMCA medicals, MOLSA permits & Enjaz visas</Text>
                        </View>
                    </View>
                    <View className="bg-amber-500 px-3.5 py-2 rounded-xl">
                        <Text className="text-slate-950 text-xs font-black">Open →</Text>
                    </View>
                </Pressable>
            </View>

            {/* Metrics Grid */}
            <View className="px-5 pt-3 flex-row flex-wrap gap-3">
                <StatCard label="Total Roster" value={candidates.length} icon={Users} color="#0F172A" bgColor="bg-slate-100" trend="+12%" />
                <StatCard label="Job Demands" value={vacancies.length} icon={Briefcase} color="#D97706" bgColor="bg-amber-50" trend="Active" />
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
                            className={`px-4 py-2 rounded-full border ${isActive
                                ? 'bg-slate-900 border-slate-900'
                                : 'bg-white border-slate-200'
                                }`}
                        >
                            <Text
                                className={`text-xs font-extrabold ${isActive ? 'text-amber-400' : 'text-slate-800'
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
                <ActivityIndicator color="#F59E0B" size="large" className="mt-10" />
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {activeTab === 'candidates' && (
                        <View>
                            <Pressable
                                onPress={() => {
                                    setWizardStep(1);
                                    setAddCandModal(true);
                                }}
                                className="bg-amber-500 py-3.5 rounded-full items-center flex-row justify-center gap-2 mb-4 shadow-sm active:bg-amber-600"
                            >
                                <Plus size={18} color="#0F172A" />
                                <Text className="text-slate-950 text-xs font-black uppercase">Add Candidate (3-Step Wizard)</Text>
                            </Pressable>

                            {candidates.map((c: any) => (
                                <View
                                    key={c.id}
                                    className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-slate-900 text-sm font-bold">
                                            {c.first_name} {c.last_name}
                                        </Text>
                                        <View
                                            className={`px-2.5 py-0.5 rounded-full ${c.medical_status === 'Cleared' || c.medical_status === 'cleared'
                                                ? 'bg-emerald-100 border border-emerald-200'
                                                : 'bg-amber-100 border border-amber-200'
                                                }`}
                                        >
                                            <Text
                                                className={`text-[10px] font-extrabold ${c.medical_status === 'Cleared' || c.medical_status === 'cleared'
                                                    ? 'text-emerald-900'
                                                    : 'text-amber-900'
                                                    }`}
                                            >
                                                {c.medical_status || 'Cleared'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-slate-700 text-xs font-semibold mt-1">
                                        {c.category_name || c.skill_category || 'Domestic Worker'}
                                    </Text>
                                    <Text className="text-slate-500 text-[11px] mt-1 font-medium">
                                        Passport: {c.passport_number || 'Valid'}
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
                                    className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                >
                                    <Text className="text-slate-900 text-sm font-bold">{v.title}</Text>
                                    <Text className="text-amber-700 text-xs font-bold mt-1">
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
                                    className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                >
                                    <Text className="text-slate-900 text-sm font-bold">
                                        {p.candidate_name || 'Candidate Profile'}
                                    </Text>
                                    <Text className="text-slate-700 text-xs mt-1">
                                        Employer: {p.employer_name} • Stage:{' '}
                                        <Text className="text-amber-700 font-bold">
                                            {p.current_stage?.replace('_', ' ')}
                                        </Text>
                                    </Text>
                                    {stageFlow
                                        .filter((s) => s.from === p.current_stage)
                                        .map((s) => (
                                            <Pressable
                                                key={s.to}
                                                onPress={() => advanceStage(p.id, s.to)}
                                                className="mt-3 bg-slate-900 py-2.5 rounded-xl items-center active:opacity-90"
                                            >
                                                <Text className="text-amber-400 text-xs font-extrabold">
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
                                    className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-xs"
                                >
                                    <Text className="text-amber-700 text-xs font-extrabold uppercase tracking-wider">
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
                                        className="mt-4 bg-amber-500 py-3 rounded-full items-center active:opacity-90"
                                    >
                                        <Text className="text-slate-950 text-xs font-black uppercase">Checkout with Chapa</Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* 3-Step Candidate Publishing Wizard Modal */}
            <Modal visible={addCandModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-3xl border-t border-slate-200 p-6 max-h-[90%]">
                        {/* Wizard Header */}
                        <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <View>
                                <Text className="text-slate-900 text-lg font-black">Add Candidate</Text>
                                <Text className="text-amber-600 text-xs font-extrabold">Step {wizardStep} of 3</Text>
                            </View>
                            <Pressable onPress={() => setAddCandModal(false)} className="p-2 rounded-full bg-slate-100">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        {/* Step Progress Bar */}
                        <View className="flex-row gap-2 mb-6">
                            <View className={`flex-1 h-1.5 rounded-full ${wizardStep >= 1 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                            <View className={`flex-1 h-1.5 rounded-full ${wizardStep >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                            <View className={`flex-1 h-1.5 rounded-full ${wizardStep >= 3 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {wizardStep === 1 && (
                                <View className="gap-3">
                                    <View>
                                        <Text className="text-slate-700 text-xs font-bold mb-1">First Name *</Text>
                                        <TextInput
                                            value={newCand.first_name}
                                            onChangeText={(v) => setNewCand({ ...newCand, first_name: v })}
                                            placeholder="Candidate First Name"
                                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-slate-700 text-xs font-bold mb-1">Last Name *</Text>
                                        <TextInput
                                            value={newCand.last_name}
                                            onChangeText={(v) => setNewCand({ ...newCand, last_name: v })}
                                            placeholder="Candidate Last Name"
                                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-slate-700 text-xs font-bold mb-1">Skill Category</Text>
                                        <TextInput
                                            value={newCand.skill_category}
                                            onChangeText={(v) => setNewCand({ ...newCand, skill_category: v })}
                                            placeholder="Domestic Worker / Driver / Chef"
                                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                                        />
                                    </View>
                                    <Pressable
                                        onPress={() => setWizardStep(2)}
                                        className="bg-slate-900 py-4 rounded-full items-center mt-4"
                                    >
                                        <Text className="text-white text-sm font-extrabold">Next: Medical & Documents →</Text>
                                    </Pressable>
                                </View>
                            )}

                            {wizardStep === 2 && (
                                <View className="gap-3">
                                    <View>
                                        <Text className="text-slate-700 text-xs font-bold mb-1">Passport Number</Text>
                                        <TextInput
                                            value={newCand.passport_number}
                                            onChangeText={(v) => setNewCand({ ...newCand, passport_number: v })}
                                            placeholder="EP1234567"
                                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-slate-700 text-xs font-bold mb-1">Medical Clearance Status</Text>
                                        <TextInput
                                            value={newCand.medical_status}
                                            onChangeText={(v) => setNewCand({ ...newCand, medical_status: v })}
                                            placeholder="Cleared / Pending"
                                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-slate-700 text-xs font-bold mb-1">Bio / Character Notes</Text>
                                        <TextInput
                                            value={newCand.notes}
                                            onChangeText={(v) => setNewCand({ ...newCand, notes: v })}
                                            placeholder="Brief background details…"
                                            multiline
                                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold h-20"
                                        />
                                    </View>
                                    <View className="flex-row gap-2 mt-4">
                                        <Pressable
                                            onPress={() => setWizardStep(1)}
                                            className="flex-1 bg-slate-100 py-4 rounded-full items-center"
                                        >
                                            <Text className="text-slate-800 text-sm font-bold">Back</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => setWizardStep(3)}
                                            className="flex-1 bg-slate-900 py-4 rounded-full items-center"
                                        >
                                            <Text className="text-white text-sm font-extrabold">Next: Review →</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {wizardStep === 3 && (
                                <View className="gap-3">
                                    <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                        <Text className="text-slate-900 text-base font-black mb-2">Review Summary</Text>
                                        <Text className="text-slate-800 text-sm font-bold">
                                            {newCand.first_name} {newCand.last_name}
                                        </Text>
                                        <Text className="text-amber-700 text-xs font-semibold mt-0.5">
                                            {newCand.skill_category} • {newCand.medical_status} Medical
                                        </Text>
                                        <Text className="text-slate-500 text-xs mt-1">
                                            Passport: {newCand.passport_number || 'Provided'}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={submitCandidateWizard}
                                        className="bg-amber-500 py-4 rounded-full items-center mt-4 shadow-sm"
                                    >
                                        <Text className="text-slate-950 text-sm font-black uppercase">Publish Candidate</Text>
                                    </Pressable>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Users, Briefcase, GitPullRequest, CreditCard, Plus, CheckCircle, ArrowLeft, X } from 'lucide-react-native';
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
        } catch { }
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

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
            Alert.alert('Checkout', `Transaction Ref: ${res.data?.tx_ref}\nVerify after payment via Chapa.`);
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
        <View className="flex-1 bg-ethiopia-navy">
            {/* Header */}
            <View className="px-5 pt-14 pb-3 flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-1.5">
                    <ArrowLeft size={20} color="#D4AF37" />
                </Pressable>
                <Text className="text-white text-base font-extrabold flex-1 ml-3">Admin Panel</Text>
                <Pressable
                    onPress={async () => { await logoutAdmin(); router.replace('/'); }}
                    className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
                >
                    <Text className="text-slate-300 text-[10px] font-bold">Sign Out</Text>
                </Pressable>
            </View>

            {/* Agency Info */}
            <View className="px-5 mb-3">
                <View className="bg-slate-900/80 border border-ethiopia-gold/20 rounded-2xl p-4 flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-ethiopia-gold items-center justify-center">
                        <ShieldCheck size={20} color="#0A192F" strokeWidth={2.5} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-sm font-extrabold">{admin?.agency_name || 'Ethio-Dubai Agency'}</Text>
                        <Text className="text-slate-400 text-[10px]">{admin?.email} • Plan: {subscription?.plan?.name || 'Professional'}</Text>
                    </View>
                </View>
            </View>

            {/* Stats */}
            <View className="px-5 flex-row gap-2 mb-3">
                {[
                    { v: candidates.length, l: 'Candidates' },
                    { v: vacancies.length, l: 'Vacancies' },
                    { v: pipelines.length, l: 'Pipelines' },
                ].map((s) => (
                    <View key={s.l} className="flex-1 bg-slate-900/80 border border-slate-800 p-3 rounded-xl items-center">
                        <Text className="text-white text-lg font-extrabold">{s.v}</Text>
                        <Text className="text-slate-400 text-[9px] font-semibold">{s.l}</Text>
                    </View>
                ))}
            </View>

            {/* Tab Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 mb-3" contentContainerStyle={{ gap: 6 }}>
                {tabs.map((tab) => (
                    <Pressable
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-xl ${activeTab === tab.key ? 'bg-ethiopia-gold' : 'bg-slate-900 border border-slate-800'}`}
                    >
                        <Text className={`text-[10px] font-bold ${activeTab === tab.key ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                            {tab.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Content */}
            {loading ? (
                <ActivityIndicator color="#D4AF37" size="large" className="mt-10" />
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {activeTab === 'candidates' && (
                        <View>
                            <Pressable
                                onPress={() => setAddCandModal(true)}
                                className="bg-ethiopia-gold py-3 rounded-2xl items-center flex-row justify-center gap-2 mb-4"
                            >
                                <Plus size={14} color="#0A192F" />
                                <Text className="text-ethiopia-navy text-xs font-extrabold">Add Candidate</Text>
                            </Pressable>
                            {candidates.map((c: any) => (
                                <View key={c.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-2.5">
                                    <Text className="text-white text-sm font-bold">{c.first_name} {c.last_name}</Text>
                                    <Text className="text-ethiopia-gold text-[10px] font-semibold mt-0.5">{c.category_name || 'Housemaid'}</Text>
                                    <View className="flex-row items-center gap-3 mt-1.5">
                                        <Text className="text-slate-400 text-[10px]">Passport: {c.passport_number || 'N/A'}</Text>
                                        <View className={`px-2 py-0.5 rounded-full ${c.medical_status === 'cleared' ? 'bg-emerald-500/15' : 'bg-slate-800'}`}>
                                            <Text className={`text-[8px] font-bold ${c.medical_status === 'cleared' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {c.medical_status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'vacancies' && (
                        <View>
                            {vacancies.map((v: any) => (
                                <View key={v.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-2.5">
                                    <Text className="text-white text-sm font-bold">{v.title}</Text>
                                    <Text className="text-ethiopia-gold text-[10px] font-semibold mt-0.5">
                                        {v.target_country} • {v.salary_monthly} {v.currency}/mo
                                    </Text>
                                    <Text className="text-slate-400 text-[10px] mt-1">
                                        Applications: {v.applications_count || 0}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'pipelines' && (
                        <View>
                            {pipelines.map((p: any) => (
                                <View key={p.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-2.5">
                                    <Text className="text-white text-sm font-bold">{p.candidate_name || 'Candidate'}</Text>
                                    <Text className="text-slate-400 text-[10px] mt-0.5">
                                        Employer: {p.employer_name} • Stage: <Text className="text-ethiopia-gold font-bold">{p.current_stage?.replace('_', ' ')}</Text>
                                    </Text>
                                    {stageFlow.filter((s) => s.from === p.current_stage).map((s) => (
                                        <Pressable
                                            key={s.to}
                                            onPress={() => advanceStage(p.id, s.to)}
                                            className="mt-2.5 bg-ethiopia-gold py-2.5 rounded-xl items-center"
                                        >
                                            <Text className="text-ethiopia-navy text-[10px] font-extrabold">Advance → {s.label}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {activeTab === 'billing' && (
                        <View>
                            <Text className="text-white text-sm font-bold mb-3">Subscription Plans</Text>
                            {plans.map((plan: any) => (
                                <View key={plan.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-3">
                                    <Text className="text-ethiopia-gold text-[10px] font-bold uppercase">{plan.code}</Text>
                                    <Text className="text-white text-base font-extrabold mt-1">{plan.name}</Text>
                                    <Text className="text-white text-xl font-black mt-1">
                                        {plan.price_etb} <Text className="text-xs text-slate-400 font-normal">ETB/mo</Text>
                                    </Text>
                                    <View className="gap-1.5 mt-2.5">
                                        <View className="flex-row items-center gap-1.5">
                                            <CheckCircle size={11} color="#D4AF37" />
                                            <Text className="text-slate-300 text-[10px]">Candidates: {plan.max_candidates}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-1.5">
                                            <CheckCircle size={11} color="#D4AF37" />
                                            <Text className="text-slate-300 text-[10px]">Vacancies: {plan.max_vacancies}</Text>
                                        </View>
                                    </View>
                                    <Pressable onPress={() => checkout(plan.id)} className="mt-3 bg-ethiopia-gold py-2.5 rounded-xl items-center">
                                        <Text className="text-ethiopia-navy text-xs font-extrabold">Checkout with Chapa</Text>
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
                <View className="flex-1 bg-black/70 justify-center items-center p-5">
                    <View className="bg-ethiopia-navy-light border border-slate-800 rounded-3xl p-6 w-full max-w-sm">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white text-base font-extrabold">Add Candidate</Text>
                            <Pressable onPress={() => setAddCandModal(false)}>
                                <X size={18} color="#94A3B8" />
                            </Pressable>
                        </View>
                        <View className="gap-3">
                            <TextInput
                                value={newCand.first_name}
                                onChangeText={(v) => setNewCand({ ...newCand, first_name: v })}
                                placeholder="First Name *"
                                placeholderTextColor="#64748B"
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs"
                            />
                            <TextInput
                                value={newCand.last_name}
                                onChangeText={(v) => setNewCand({ ...newCand, last_name: v })}
                                placeholder="Last Name *"
                                placeholderTextColor="#64748B"
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs"
                            />
                            <TextInput
                                value={newCand.passport_number}
                                onChangeText={(v) => setNewCand({ ...newCand, passport_number: v })}
                                placeholder="Passport Number *"
                                placeholderTextColor="#64748B"
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs"
                            />
                            <Pressable onPress={addCandidate} className="bg-ethiopia-gold py-3 rounded-2xl items-center mt-1">
                                <Text className="text-ethiopia-navy text-xs font-extrabold">Save Candidate</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

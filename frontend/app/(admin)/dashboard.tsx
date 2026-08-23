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
    Image,
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
    Search,
    ChevronRight,
    Award,
    FileCheck,
    Plane,
    DollarSign,
    MapPin,
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
    { from: 'SELECTED', to: 'DOCUMENTATION', label: 'Process Visa Docs' },
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
    const [searchQuery, setSearchQuery] = useState('');

    // Candidate Details Inspector Modal State
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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

    // Demand Order Creation Modal State
    const [addVacancyModal, setAddVacancyModal] = useState(false);
    const [newVacancy, setNewVacancy] = useState({
        title: 'Housemaid & Cook',
        target_country: 'Saudi Arabia',
        target_city: 'Riyadh',
        salary_monthly: '450',
        contract_duration_years: '2',
        headcount_needed: '5',
        description: 'Requires cooking skill and Arabic language basics.',
    });

    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const sampleAdminCandidates = [
        {
            id: 'cand-admin-1',
            first_name: 'Alem',
            last_name: 'Tadesse',
            candidate_code: 'ET-8492',
            skill_category: 'Housemaid',
            experience_years: '3',
            medical_status: 'Cleared',
            passport_status: 'Valid',
            passport_number: 'EP-849201',
            status: 'ACTIVE',
            preferred_country: 'Saudi Arabia',
            notes: 'Fluent in Arabic cooking and household management. 3 years experience in Riyadh.',
            photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
        },
        {
            id: 'cand-admin-2',
            first_name: 'Tigist',
            last_name: 'Assefa',
            candidate_code: 'ET-8493',
            skill_category: 'Cook & Housemaid',
            experience_years: '5',
            medical_status: 'Cleared',
            passport_status: 'Valid',
            passport_number: 'EP-849302',
            status: 'ACTIVE',
            preferred_country: 'UAE',
            notes: 'Specialist in Middle Eastern cuisine, pastry, and family care.',
            photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        },
        {
            id: 'cand-admin-3',
            first_name: 'Genet',
            last_name: 'Haile',
            candidate_code: 'ET-8494',
            skill_category: 'Nanny & Caregiver',
            experience_years: '2',
            medical_status: 'Pending Medical',
            passport_status: 'Valid',
            passport_number: 'EP-849403',
            status: 'ON_HOLD',
            preferred_country: 'Kuwait',
            notes: 'Certified in infant care, first aid, and English communication.',
            photo_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200',
        },
        {
            id: 'cand-admin-4',
            first_name: 'Meskerm',
            last_name: 'Bekele',
            candidate_code: 'ET-8495',
            skill_category: 'Elderly Caregiver',
            experience_years: '4',
            medical_status: 'Cleared',
            passport_status: 'Valid',
            passport_number: 'EP-849504',
            status: 'ACTIVE',
            preferred_country: 'Qatar',
            notes: 'Patient caregiver experienced with mobility assistance and medication monitoring.',
            photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200',
        },
    ];

    const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');
    const [selectedVacancy, setSelectedVacancy] = useState<any>(null);

    const sampleAdminVacancies = [
        {
            id: 'vac-admin-1',
            order_code: 'DO-SA-101',
            title: 'Housemaid & Arabic Cook',
            employer_name: 'Al-Harbi Household',
            target_country: 'Saudi Arabia',
            target_city: 'Riyadh',
            salary_monthly: '450',
            headcount_total: 10,
            headcount_filled: 6,
            attestation_status: 'Attested by Embassy',
            applications_count: 8,
            contract_years: 2,
            description: 'Seeking experienced Ethiopian housemaid fluent in Arabic cooking and household management for family of 5 in Riyadh.',
        },
        {
            id: 'vac-admin-2',
            order_code: 'DO-UAE-204',
            title: 'Child Caregiver & Nanny',
            employer_name: 'Al-Mansoori Residence',
            target_country: 'UAE',
            target_city: 'Dubai',
            salary_monthly: '500',
            headcount_total: 5,
            headcount_filled: 3,
            attestation_status: 'Attested by Embassy',
            applications_count: 5,
            contract_years: 2,
            description: 'Private villa in Dubai seeking gentle Ethiopian nanny with infant care experience and basic English communication.',
        },
        {
            id: 'vac-admin-3',
            order_code: 'DO-KW-309',
            title: 'Senior Housemaid & Cleaner',
            employer_name: 'Al-Sabah Household',
            target_country: 'Kuwait',
            target_city: 'Kuwait City',
            salary_monthly: '400',
            headcount_total: 8,
            headcount_filled: 2,
            attestation_status: 'MOLSA Visa Issued',
            applications_count: 6,
            contract_years: 2,
            description: 'Kuwaiti household needing energetic domestic worker experienced in laundry, ironing, and deep home cleaning.',
        },
        {
            id: 'vac-admin-4',
            order_code: 'DO-QA-412',
            title: 'Elderly Caregiver Specialist',
            employer_name: 'Al-Thani Residence',
            target_country: 'Qatar',
            target_city: 'Doha',
            salary_monthly: '550',
            headcount_total: 4,
            headcount_filled: 4,
            attestation_status: 'Completed / Filled',
            applications_count: 12,
            contract_years: 2,
            description: 'Doha home requiring certified female Ethiopian caregiver for elderly matriarch.',
        },
    ];

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
            const fetchedCandidates = cRes.data || [];
            const fetchedVacancies = vRes.data || [];
            setCandidates(fetchedCandidates.length > 0 ? fetchedCandidates : sampleAdminCandidates);
            setVacancies(fetchedVacancies.length > 0 ? fetchedVacancies : sampleAdminVacancies);
            setPipelines(pRes.data || []);
            setSubscription(sRes.data || null);
            setPlans(plRes.data || []);
        } catch (e) {
            setCandidates(sampleAdminCandidates);
            setVacancies(sampleAdminVacancies);
        }
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

    async function submitVacancy() {
        if (!newVacancy.title || !newVacancy.target_country) {
            Alert.alert('Required', 'Job title and target country are required.');
            return;
        }
        try {
            await vacancyService.createAdminVacancy({
                title: newVacancy.title,
                target_country: newVacancy.target_country,
                salary_monthly: parseFloat(newVacancy.salary_monthly) || 450,
                description: newVacancy.description,
            });
            setAddVacancyModal(false);
            setNewVacancy({
                title: 'Housemaid & Cook',
                target_country: 'Saudi Arabia',
                target_city: 'Riyadh',
                salary_monthly: '450',
                contract_duration_years: '2',
                headcount_needed: '5',
                description: 'Requires cooking skill and Arabic language basics.',
            });
            loadData();
            Alert.alert('Success', 'Employer Demand Order created successfully!');
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to create demand order.');
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
                'Checkout Initialized',
                `Transaction Ref: ${res.data?.tx_ref || 'CHAPA-TX-849102'}\nComplete payment via Chapa gateway.`,
            );
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    }

    const filteredCandidates = candidates.filter((c) => {
        const q = searchQuery.toLowerCase();
        const name = `${c.first_name} ${c.last_name}`.toLowerCase();
        const cat = (c.skill_category || c.category_name || '').toLowerCase();
        return name.includes(q) || cat.includes(q);
    });

    const tabs = [
        { key: 'candidates', label: `Candidates (${candidates.length})` },
        { key: 'vacancies', label: `Demand Orders (${vacancies.length})` },
        { key: 'pipelines', label: `ATS Pipeline (${pipelines.length})` },
        { key: 'billing', label: 'SaaS Billing' },
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
                                {activeWorkspace?.name || 'Ethio-Gulf Overseas Manpower Agency'}
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
                <StatCard label="Demand Orders" value={vacancies.length} icon={Briefcase} color="#D97706" bgColor="bg-amber-50" trend="Active" />
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

            {/* Search Bar for Candidates */}
            {activeTab === 'candidates' && (
                <View className="px-5 mb-3">
                    <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                        <Search size={16} color="#64748B" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Filter agency candidate roster..."
                            placeholderTextColor="#94A3B8"
                            className="flex-1 text-slate-900 text-xs ml-2.5 py-2.5 font-medium"
                        />
                    </View>
                </View>
            )}

            {/* Main Content Area */}
            {loading ? (
                <ActivityIndicator color="#F59E0B" size="large" className="mt-10" />
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {/* CANDIDATES TAB */}
                    {activeTab === 'candidates' && (
                        <View>
                            {/* Skill Category Filter Chips */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3.5 flex-row">
                                {['ALL', 'Housemaid', 'Cook & Housemaid', 'Nanny & Caregiver', 'Elderly Caregiver'].map((cat) => (
                                    <Pressable
                                        key={cat}
                                        onPress={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-full mr-2 border ${selectedCategory === cat
                                            ? 'bg-amber-500 border-amber-600'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[11px] font-extrabold ${selectedCategory === cat ? 'text-slate-950' : 'text-slate-700'
                                                }`}
                                        >
                                            {cat}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

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

                            {filteredCandidates
                                .filter((c) => selectedCategory === 'ALL' || (c.skill_category || '').toLowerCase().includes(selectedCategory.toLowerCase()))
                                .length === 0 ? (
                                <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-2 shadow-xs">
                                    <Users size={32} color="#94A3B8" />
                                    <Text className="text-slate-900 text-sm font-bold mt-2">No Candidates Found</Text>
                                    <Text className="text-slate-500 text-xs text-center mt-1">Tap "Add Candidate" to publish domestic workers to your roster.</Text>
                                </View>
                            ) : (
                                filteredCandidates
                                    .filter((c) => selectedCategory === 'ALL' || (c.skill_category || '').toLowerCase().includes(selectedCategory.toLowerCase()))
                                    .map((c: any) => (
                                        <View
                                            key={c.id}
                                            className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                        >
                                            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                                                <View className="flex-row items-center flex-1 mr-2">
                                                    <View className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden mr-3 items-center justify-center">
                                                        {c.photo_url ? (
                                                            <Image source={{ uri: c.photo_url }} className="w-full h-full" />
                                                        ) : (
                                                            <Users size={20} color="#64748B" />
                                                        )}
                                                    </View>
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center gap-1.5 mb-0.5">
                                                            <View className="bg-slate-900 px-1.5 py-0.5 rounded-md">
                                                                <Text className="text-amber-400 text-[9px] font-black">{c.candidate_code || 'ET-8492'}</Text>
                                                            </View>
                                                            <Text className="text-slate-900 text-sm font-extrabold flex-1" numberOfLines={1}>
                                                                {c.first_name} {c.last_name}
                                                            </Text>
                                                        </View>
                                                        <Text className="text-slate-600 text-xs font-semibold">
                                                            {c.skill_category || 'Domestic Worker'} • {c.experience_years || '3'} yrs exp
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View
                                                    className={`px-2.5 py-1 rounded-full border ${c.medical_status === 'Cleared' || c.medical_status === 'cleared'
                                                        ? 'bg-emerald-50 border-emerald-200'
                                                        : 'bg-amber-50 border-amber-200'
                                                        }`}
                                                >
                                                    <Text
                                                        className={`text-[10px] font-black ${c.medical_status === 'Cleared' || c.medical_status === 'cleared'
                                                            ? 'text-emerald-800'
                                                            : 'text-amber-800'
                                                            }`}
                                                    >
                                                        {c.medical_status || 'GAMCA Cleared'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="flex-row items-center justify-between mt-3">
                                                <View className="flex-row items-center gap-2">
                                                    <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                                                        <Text className="text-slate-700 text-[10px] font-bold">Pref: {c.preferred_country || 'Saudi Arabia'}</Text>
                                                    </View>
                                                    <View className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                        <Text className="text-blue-800 text-[10px] font-bold">Passport: {c.passport_number || 'EP-849201'}</Text>
                                                    </View>
                                                </View>

                                                <Pressable
                                                    onPress={() => setSelectedCandidate(c)}
                                                    className="bg-slate-900 px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-90"
                                                >
                                                    <Text className="text-amber-400 text-xs font-black">Inspect Details →</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ))
                            )}
                        </View>
                    )}

                    {/* VACANCIES / DEMAND ORDERS TAB */}
                    {activeTab === 'vacancies' && (
                        <View>
                            {/* Destination Country Filter Bar */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3.5 flex-row">
                                {['ALL', 'Saudi Arabia', 'UAE', 'Kuwait', 'Qatar'].map((cntry) => (
                                    <Pressable
                                        key={cntry}
                                        onPress={() => setSelectedCountryFilter(cntry)}
                                        className={`px-3.5 py-1.5 rounded-full mr-2 border ${selectedCountryFilter === cntry
                                            ? 'bg-amber-500 border-amber-600'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[11px] font-extrabold ${selectedCountryFilter === cntry ? 'text-slate-950' : 'text-slate-700'
                                                }`}
                                        >
                                            {cntry}
                                        </Text>
                                    </Pressable>
                                ))}
                            </ScrollView>

                            <Pressable
                                onPress={() => setAddVacancyModal(true)}
                                className="bg-amber-500 py-3.5 rounded-full items-center flex-row justify-center gap-2 mb-4 shadow-sm active:bg-amber-600"
                            >
                                <Plus size={18} color="#0F172A" />
                                <Text className="text-slate-950 text-xs font-black uppercase">Post New Demand Order</Text>
                            </Pressable>

                            {vacancies
                                .filter((v) => selectedCountryFilter === 'ALL' || (v.target_country || '').toLowerCase().includes(selectedCountryFilter.toLowerCase()))
                                .length === 0 ? (
                                <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-2 shadow-xs">
                                    <Briefcase size={32} color="#94A3B8" />
                                    <Text className="text-slate-900 text-sm font-bold mt-2">No Demand Orders Found</Text>
                                    <Text className="text-slate-500 text-xs text-center mt-1">Tap "Post New Demand Order" to publish B2B requests.</Text>
                                </View>
                            ) : (
                                vacancies
                                    .filter((v) => selectedCountryFilter === 'ALL' || (v.target_country || '').toLowerCase().includes(selectedCountryFilter.toLowerCase()))
                                    .map((v: any) => (
                                        <View
                                            key={v.id}
                                            className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                        >
                                            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
                                                <View className="flex-1 mr-2">
                                                    <View className="flex-row items-center gap-2 mb-1">
                                                        <View className="bg-slate-900 px-2 py-0.5 rounded-md">
                                                            <Text className="text-amber-400 text-[10px] font-black">{v.order_code || 'DO-SA-101'}</Text>
                                                        </View>
                                                        <Text className="text-slate-900 text-sm font-black flex-1" numberOfLines={1}>
                                                            {v.title}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-slate-600 text-xs font-extrabold">
                                                        Employer: {v.employer_name || 'Al-Harbi Household'}
                                                    </Text>
                                                </View>

                                                <View className="bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full">
                                                    <Text className="text-amber-900 text-[10px] font-black">
                                                        {v.target_country || 'Saudi Arabia'} ({v.target_city || 'Riyadh'})
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="flex-row items-center justify-between py-2.5">
                                                <View>
                                                    <Text className="text-slate-400 text-[10px] font-semibold">Monthly Salary</Text>
                                                    <Text className="text-emerald-700 text-sm font-extrabold">${v.salary_monthly || '450'} USD/mo</Text>
                                                </View>

                                                <View className="items-end">
                                                    <Text className="text-slate-400 text-[10px] font-semibold">Quota / Headcount</Text>
                                                    <Text className="text-slate-900 text-xs font-black">
                                                        {v.headcount_filled || 6} / {v.headcount_total || 10} Filled
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="flex-row items-center justify-between pt-2.5 border-t border-slate-100">
                                                <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                                                    <Text className="text-emerald-800 text-[10px] font-extrabold">
                                                        {v.attestation_status || 'Attested by Embassy'}
                                                    </Text>
                                                </View>

                                                <Pressable
                                                    onPress={() => setSelectedVacancy(v)}
                                                    className="bg-slate-900 px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-90"
                                                >
                                                    <Text className="text-amber-400 text-xs font-black">Inspect Order →</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    ))
                            )}
                        </View>
                    )}

                    {/* PIPELINES TAB */}
                    {activeTab === 'pipelines' && (
                        <View>
                            {pipelines.map((p: any) => (
                                <View
                                    key={p.id}
                                    className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                >
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-slate-900 text-sm font-extrabold">
                                            {p.candidate_name || 'Alem Tadesse'}
                                        </Text>
                                        <View className="bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                                            <Text className="text-blue-900 text-[10px] font-extrabold">Ref #ET-8492</Text>
                                        </View>
                                    </View>
                                    <Text className="text-slate-700 text-xs font-medium mt-0.5">
                                        Employer: <Text className="font-bold text-slate-900">{p.employer_name || 'Al-Harbi Family'}</Text>
                                    </Text>
                                    <Text className="text-slate-500 text-xs mt-0.5 font-medium">
                                        Current Milestone: <Text className="text-amber-700 font-black">{p.current_stage?.replace('_', ' ') || 'UNDER REVIEW'}</Text>
                                    </Text>

                                    {stageFlow
                                        .filter((s) => s.from === (p.current_stage || 'UNDER_REVIEW'))
                                        .map((s) => (
                                            <Pressable
                                                key={s.to}
                                                onPress={() => advanceStage(p.id, s.to)}
                                                className="mt-3 bg-slate-900 py-2.5 rounded-xl items-center active:opacity-90 shadow-xs"
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

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <View>
                            {/* Current Active Plan Status */}
                            <View className="bg-slate-900 p-5 rounded-3xl mb-4 border border-slate-800 shadow-md">
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-white text-base font-black">Active Agency License</Text>
                                    <View className="bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                                        <Text className="text-emerald-400 text-[10px] font-black uppercase">ACTIVE SAAS</Text>
                                    </View>
                                </View>
                                <Text className="text-amber-400 text-xs font-bold">MOLSA Accreditation: MOLSA/LIC/2024/849</Text>
                                <Text className="text-slate-400 text-xs mt-1 font-medium">
                                    Enterprise Overseas Recruitment SaaS Plan • Active until Dec 2026
                                </Text>
                            </View>

                            <Text className="text-slate-900 text-sm font-bold mb-3">
                                Available Agency Subscription Plans
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
                                        className="mt-4 bg-amber-500 py-3 rounded-full items-center active:opacity-90 shadow-xs"
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

            {/* Candidate Inspector Modal */}
            <Modal visible={!!selectedCandidate} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
                            <Text className="text-slate-900 text-base font-extrabold">Candidate Credential Inspector</Text>
                            <Pressable onPress={() => setSelectedCandidate(null)} className="p-1 bg-slate-100 rounded-full">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        {selectedCandidate && (
                            <View className="gap-2 my-2">
                                <Text className="text-slate-900 text-lg font-black">
                                    {selectedCandidate.first_name} {selectedCandidate.last_name}
                                </Text>
                                <Text className="text-amber-600 text-xs font-extrabold">
                                    Category: {selectedCandidate.skill_category || 'Domestic Worker'}
                                </Text>

                                <View className="bg-slate-50 p-3 rounded-2xl border border-slate-200 gap-1.5 mt-2">
                                    <Text className="text-xs text-slate-700 font-medium">
                                        <Text className="font-bold">Medical Status:</Text> {selectedCandidate.medical_status || 'GAMCA Cleared'}
                                    </Text>
                                    <Text className="text-xs text-slate-700 font-medium">
                                        <Text className="font-bold">Passport Ref:</Text> {selectedCandidate.passport_number || 'EP-849201'}
                                    </Text>
                                    <Text className="text-xs text-slate-700 font-medium">
                                        <Text className="font-bold">Experience:</Text> {selectedCandidate.experience_years || '3'} Years
                                    </Text>
                                </View>

                                <Pressable
                                    onPress={() => setSelectedCandidate(null)}
                                    className="mt-4 bg-slate-900 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-white text-xs font-bold">Close Inspector</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Post New Demand Order Modal */}
            <Modal visible={addVacancyModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
                            <Text className="text-slate-900 text-base font-extrabold">Create Demand Order</Text>
                            <Pressable onPress={() => setAddVacancyModal(false)} className="p-1 bg-slate-100 rounded-full">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>

                        <View className="gap-3 my-2">
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">Job Title / Category</Text>
                                <TextInput
                                    value={newVacancy.title}
                                    onChangeText={(v) => setNewVacancy({ ...newVacancy, title: v })}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                                />
                            </View>
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">Target Country</Text>
                                <TextInput
                                    value={newVacancy.target_country}
                                    onChangeText={(v) => setNewVacancy({ ...newVacancy, target_country: v })}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                                />
                            </View>
                            <View>
                                <Text className="text-slate-700 text-xs font-bold mb-1">Monthly Salary (USD)</Text>
                                <TextInput
                                    value={newVacancy.salary_monthly}
                                    onChangeText={(v) => setNewVacancy({ ...newVacancy, salary_monthly: v })}
                                    keyboardType="numeric"
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                                />
                            </View>

                            <View className="flex-row gap-3 mt-3">
                                <Pressable
                                    onPress={() => setAddVacancyModal(false)}
                                    className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={submitVacancy}
                                    className="flex-1 bg-amber-500 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                                >
                                    <Text className="text-slate-950 text-xs font-black">Publish Order</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

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

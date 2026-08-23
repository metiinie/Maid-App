import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    Pressable,
    ActivityIndicator,
    Modal,
    Alert,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import {
    Search,
    Briefcase,
    MapPin,
    DollarSign,
    CheckCircle2,
    ShieldCheck,
    X,
    Building2,
    Heart,
    ChevronRight,
    MessageSquare,
    Globe,
    Send,
    Plus,
    Users,
    Clock,
    FileText,
} from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { vacancyService } from '../../services/vacancyService';
import { bookmarkService, SavedVacancy } from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function VacanciesScreen() {
    const { user, activeWorkspace, switchWorkspace } = useAuth();
    const router = useRouter();
    const { openChatWithAgency } = useChat();

    // Default segment based on active workspace, allow user to toggle freely
    const [viewSegment, setViewSegment] = useState<'requests' | 'jobs'>(
        activeWorkspace?.type === 'GULF_EMPLOYER' ? 'requests' : 'jobs'
    );

    const isEmployer = viewSegment === 'requests';

    const [vacancies, setVacancies] = useState<any[]>([]);
    const [demandOrders, setDemandOrders] = useState<any[]>([
        {
            id: 'do-101',
            title: '5x Experienced Housemaids (Arabic Cooking)',
            target_country: 'Saudi Arabia (Riyadh)',
            category: 'Housemaid & Cook',
            quantity: 5,
            filled: 3,
            salary_monthly: '1,500 SAR ($400 USD)',
            agency_name: 'Ethio-Gulf Overseas Recruitment',
            status: 'Processing',
            created_at: '2 days ago',
        },
        {
            id: 'do-102',
            title: '2x Infant Nannies / Childcare Specialists',
            target_country: 'UAE (Dubai)',
            category: 'Nanny / Childcare Specialist',
            quantity: 2,
            filled: 2,
            salary_monthly: '1,700 AED ($460 USD)',
            agency_name: 'Blue Nile Foreign Employment Enterprise',
            status: 'Deployment Ready',
            created_at: '1 week ago',
        },
    ]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [selectedCountry, setSelectedCountry] = useState('ALL');
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    // Modal state for Job Seekers applying
    const [applyingVacancy, setApplyingVacancy] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Modal state for Employers posting demand orders
    const [showDemandModal, setShowDemandModal] = useState(false);
    const [newDemandTitle, setNewDemandTitle] = useState('');
    const [newDemandCategory, setNewDemandCategory] = useState('Housemaid & Cook');
    const [newDemandCountry, setNewDemandCountry] = useState('Saudi Arabia (Riyadh)');
    const [newDemandQuantity, setNewDemandQuantity] = useState('3');
    const [newDemandSalary, setNewDemandSalary] = useState('1,500 SAR ($400 USD)');

    const categories = [
        { id: 'ALL', label: 'All Roles' },
        { id: 'DOMESTIC', label: 'Domestic Worker' },
        { id: 'NANNY', label: 'Nanny / Childcare' },
        { id: 'CAREGIVER', label: 'Elderly Care' },
        { id: 'COOK', label: 'Arabic Cook' },
        { id: 'DRIVER', label: 'Driver' },
    ];

    const countries = [
        { id: 'ALL', label: 'All Countries' },
        { id: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' },
        { id: 'UAE', label: '🇦🇪 UAE' },
        { id: 'Kuwait', label: '🇰🇼 Kuwait' },
        { id: 'Qatar', label: '🇶🇦 Qatar' },
    ];

    useFocusEffect(
        useCallback(() => {
            fetchVacancies(false);
            loadSavedBookmarks();
        }, [activeCategory, selectedCountry])
    );

    async function loadSavedBookmarks() {
        try {
            const saved = await bookmarkService.getSavedVacancies();
            setSavedIds(new Set(saved.map((s) => s.id)));
        } catch { }
    }

    async function toggleBookmark(vac: any) {
        const item: SavedVacancy = {
            id: vac.id,
            title: vac.title,
            target_country: vac.target_country || vac.country || 'Saudi Arabia',
            salary_monthly: vac.salary_monthly || '$400 USD',
            agency_name: vac.agency_name,
            contract_type: vac.contract_type,
        };
        const isSavedNow = await bookmarkService.toggleSaveVacancy(item);
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (isSavedNow) next.add(vac.id);
            else next.delete(vac.id);
            return next;
        });
    }

    async function fetchVacancies(showLoader = true) {
        if (showLoader) setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (activeCategory !== 'ALL') params.category = activeCategory;
            const res: any = await vacancyService.getPublicVacancies(params);
            const list = res.data || [];

            if (list.length === 0) {
                setVacancies([
                    {
                        id: 'vac-101',
                        title: 'Experienced Housemaid & Arabic Cook',
                        agency_id: 'agency-1',
                        agency_name: 'Ethio-Gulf Overseas Recruitment',
                        molsa_license: 'MOLSA License #ET-REC-2024-089',
                        target_country: 'Saudi Arabia (Riyadh)',
                        country_code: 'Saudi Arabia',
                        country_flag: '🇸🇦',
                        salary_monthly: '1,500 SAR ($400 USD)',
                        currency: 'SAR',
                        contract_type: '2-Year Renewable Contract',
                        benefits: ['Free Food & Private Room', 'Round-Trip Air Ticket', 'Medical Insurance Included'],
                    },
                    {
                        id: 'vac-102',
                        title: 'Nanny / Infant Care Specialist',
                        agency_id: 'agency-2',
                        agency_name: 'Blue Nile Foreign Employment',
                        molsa_license: 'MOLSA License #ET-REC-2024-042',
                        target_country: 'United Arab Emirates (Dubai)',
                        country_code: 'UAE',
                        country_flag: '🇦🇪',
                        salary_monthly: '1,600 AED ($435 USD)',
                        currency: 'AED',
                        contract_type: '2-Year Renewable Contract',
                        benefits: ['Free Accommodation', 'Health Insurance', 'Annual Paid Leave'],
                    },
                    {
                        id: 'vac-103',
                        title: 'Senior Elderly Caregiver',
                        agency_id: 'agency-3',
                        agency_name: 'Addis Overseas Recruitment',
                        molsa_license: 'MOLSA License #ET-REC-2024-115',
                        target_country: 'Kuwait (Kuwait City)',
                        country_code: 'Kuwait',
                        country_flag: '🇰🇼',
                        salary_monthly: '130 KWD ($425 USD)',
                        currency: 'KWD',
                        contract_type: '2-Year Renewable Contract',
                        benefits: ['Free Food & Housing', 'Medical Insurance', 'Flight Ticket Provided'],
                    },
                ]);
            } else {
                setVacancies(list);
            }
        } catch (err) {
            console.error('Failed to fetch vacancies:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        fetchVacancies(false);
    };

    async function handleApply() {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to apply for job vacancies.', [
                { text: 'Cancel' },
                { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
            ]);
            return;
        }
        if (!applyingVacancy) return;
        setSubmitting(true);
        try {
            await vacancyService.applyToVacancy(applyingVacancy.id);
            setSuccess(true);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    }

    function handleCreateDemandOrder() {
        if (!newDemandTitle.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for your demand order.');
            return;
        }
        const created = {
            id: `do-${Date.now()}`,
            title: newDemandTitle,
            target_country: newDemandCountry,
            category: newDemandCategory,
            quantity: parseInt(newDemandQuantity) || 1,
            filled: 0,
            salary_monthly: newDemandSalary,
            agency_name: 'Ethio-Gulf Overseas Manpower Agency',
            status: 'Processing',
            created_at: 'Just now',
        };
        setDemandOrders((prev) => [created, ...prev]);
        setShowDemandModal(false);
        setNewDemandTitle('');
        Alert.alert('Demand Order Submitted', 'Your bulk recruitment demand order has been broadcasted to verified agencies.');
    }

    const filteredVacancies = vacancies.filter((vac) => {
        if (selectedCountry === 'ALL') return true;
        const target = (vac.target_country || vac.country_code || '').toLowerCase();
        return target.includes(selectedCountry.toLowerCase());
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1 mr-2">
                        <Text className="text-slate-900 text-xl font-extrabold">
                            {isEmployer ? 'My Demand Orders' : 'Find Job Vacancies'}
                        </Text>
                        <Text className="text-slate-500 text-xs mt-0.5 font-medium">
                            {isEmployer
                                ? 'Manage bulk recruitment demand orders for Ethiopian workers'
                                : 'Verified Gulf employment opportunities for Ethiopian workers'}
                        </Text>
                    </View>
                    {isEmployer ? (
                        <Pressable
                            onPress={() => setShowDemandModal(true)}
                            className="bg-amber-500 px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:opacity-90 shadow-xs"
                        >
                            <Plus size={16} color="#0F172A" />
                            <Text className="text-slate-950 text-xs font-black">Post Order</Text>
                        </Pressable>
                    ) : (
                        <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center">
                            <ShieldCheck size={12} color="#059669" />
                            <Text className="text-emerald-800 text-[10px] font-extrabold ml-1 uppercase">MOLSA Approved</Text>
                        </View>
                    )}
                </View>

                {/* Segment Toggle Switcher */}
                <View className="flex-row bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <TouchableOpacity
                        onPress={() => setViewSegment('requests')}
                        className={`flex-1 py-2 rounded-xl items-center ${viewSegment === 'requests' ? 'bg-amber-500 shadow-xs' : 'bg-transparent'}`}
                    >
                        <Text className={`text-xs font-black ${viewSegment === 'requests' ? 'text-slate-950' : 'text-slate-700'}`}>
                            My Requests ({demandOrders.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setViewSegment('jobs')}
                        className={`flex-1 py-2 rounded-xl items-center ${viewSegment === 'jobs' ? 'bg-emerald-600 shadow-xs' : 'bg-transparent'}`}
                    >
                        <Text className={`text-xs font-black ${viewSegment === 'jobs' ? 'text-white' : 'text-slate-700'}`}>
                            Find Jobs ({vacancies.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* EMPLOYER VIEW: Demand Orders Hub */}
            {isEmployer ? (
                <ScrollView
                    className="flex-1 px-5 pt-4"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D97706']} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Employer Quick Stats */}
                    <View className="flex-row gap-2 mb-4">
                        <View className="flex-1 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                            <Text className="text-amber-400 text-lg font-black">{demandOrders.length}</Text>
                            <Text className="text-slate-400 text-[10px] font-extrabold uppercase mt-0.5">Active Demand Orders</Text>
                        </View>
                        <View className="flex-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                            <Text className="text-slate-900 text-lg font-black">
                                {demandOrders.reduce((sum, d) => sum + d.quantity, 0)}
                            </Text>
                            <Text className="text-slate-500 text-[10px] font-extrabold uppercase mt-0.5">Total Workers Requested</Text>
                        </View>
                        <View className="flex-1 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                            <Text className="text-emerald-800 text-lg font-black">
                                {demandOrders.reduce((sum, d) => sum + d.filled, 0)}
                            </Text>
                            <Text className="text-emerald-700 text-[10px] font-extrabold uppercase mt-0.5">Candidates Assigned</Text>
                        </View>
                    </View>

                    {/* Section Header */}
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-slate-900 text-sm font-black uppercase tracking-wider">Your Submitted Orders</Text>
                        <Pressable
                            onPress={() => setShowDemandModal(true)}
                            className="bg-amber-100 border border-amber-200 px-3 py-1 rounded-xl flex-row items-center gap-1 active:opacity-80"
                        >
                            <Plus size={12} color="#D97706" />
                            <Text className="text-amber-900 text-xs font-bold">New Order</Text>
                        </Pressable>
                    </View>

                    {/* Demand Orders List */}
                    {demandOrders.map((order) => (
                        <View key={order.id} className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                    <Text className="text-amber-900 text-[10px] font-extrabold">{order.category}</Text>
                                </View>
                                <View
                                    className={`px-2.5 py-0.5 rounded-full ${order.status === 'Deployment Ready'
                                        ? 'bg-emerald-100 border border-emerald-200'
                                        : 'bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    <Text
                                        className={`text-[10px] font-extrabold ${order.status === 'Deployment Ready' ? 'text-emerald-900' : 'text-slate-700'
                                            }`}
                                    >
                                        {order.status}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-slate-900 text-base font-extrabold">{order.title}</Text>
                            <Text className="text-slate-500 text-xs font-medium mt-0.5">{order.target_country}</Text>

                            <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                                <View className="flex-row items-center gap-1">
                                    <Users size={14} color="#64748B" />
                                    <Text className="text-slate-800 text-xs font-bold">
                                        {order.filled} / {order.quantity} Filled
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-1">
                                    <DollarSign size={14} color="#059669" />
                                    <Text className="text-emerald-700 text-xs font-extrabold">{order.salary_monthly}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center gap-2 mt-4">
                                <Pressable
                                    onPress={() => router.push('/(tabs)/candidates')}
                                    className="flex-1 bg-slate-900 py-2.5 rounded-xl items-center justify-center active:opacity-90"
                                >
                                    <Text className="text-amber-400 text-xs font-extrabold">View Matched Candidates</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => openChatWithAgency('agency-1', order.agency_name, 'demand_order', order.id)}
                                    className="bg-emerald-600 px-4 py-2.5 rounded-xl items-center justify-center flex-row gap-1 active:opacity-90 shadow-xs"
                                >
                                    <MessageSquare size={14} color="#FFFFFF" />
                                    <Text className="text-white text-xs font-extrabold">Chat Agency</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}
                    <View className="h-20" />
                </ScrollView>
            ) : (
                /* JOB SEEKER VIEW: Find Job Vacancies */
                <View className="flex-1">
                    {/* Search Bar */}
                    <View className="px-5 mt-4 mb-2">
                        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                            <Search size={16} color="#64748B" />
                            <TextInput
                                value={search}
                                onChangeText={setSearch}
                                onSubmitEditing={() => fetchVacancies(true)}
                                placeholder="Search job title, country (Saudi Arabia, UAE)..."
                                placeholderTextColor="#94A3B8"
                                className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                                returnKeyType="search"
                            />
                        </View>
                    </View>

                    {/* Destination Country Filter Chips */}
                    <View className="px-5 mb-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 py-1">
                            {countries.map((c) => {
                                const isSel = selectedCountry === c.id;
                                return (
                                    <TouchableOpacity
                                        key={c.id}
                                        onPress={() => setSelectedCountry(c.id)}
                                        className={`px-3 py-1.5 rounded-full border ${isSel
                                            ? 'bg-slate-900 border-slate-900 shadow-xs'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <Text className={`text-[11px] font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>
                                            {c.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Category Filter Chips Bar */}
                    <View className="px-5 mb-3">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                            {categories.map((cat) => {
                                const active = activeCategory === cat.id;
                                return (
                                    <Pressable
                                        key={cat.id}
                                        onPress={() => setActiveCategory(cat.id)}
                                        className={`px-3.5 py-2 rounded-xl border ${active
                                            ? 'bg-emerald-600 border-emerald-700 shadow-xs'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-700'}`}>
                                            {cat.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Job Cards List */}
                    {loading ? (
                        <ActivityIndicator color="#059669" size="large" className="mt-10" />
                    ) : (
                        <ScrollView
                            className="px-5 flex-1"
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                            showsVerticalScrollIndicator={false}
                        >
                            {filteredVacancies.length === 0 ? (
                                <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                                    <Briefcase size={32} color="#94A3B8" />
                                    <Text className="text-slate-900 text-sm font-bold mt-3">No vacancies found</Text>
                                    <Text className="text-slate-500 text-xs text-center mt-1">Try searching for a different title or country filter.</Text>
                                </View>
                            ) : (
                                filteredVacancies.map((vac: any) => {
                                    const isSaved = savedIds.has(vac.id);
                                    return (
                                        <View
                                            key={vac.id}
                                            className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs"
                                        >
                                            <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-slate-100">
                                                <View className="flex-row items-center gap-1.5 flex-1 mr-2">
                                                    <Building2 size={14} color="#059669" />
                                                    <Text className="text-emerald-700 text-xs font-bold flex-1" numberOfLines={1}>{vac.agency_name}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-slate-400 text-[10px] font-bold">{vac.molsa_license}</Text>
                                                    <Pressable onPress={() => toggleBookmark(vac)} className="p-1">
                                                        <Heart
                                                            size={18}
                                                            color={isSaved ? '#EF4444' : '#94A3B8'}
                                                            fill={isSaved ? '#EF4444' : 'none'}
                                                        />
                                                    </Pressable>
                                                </View>
                                            </View>

                                            <Pressable onPress={() => router.push(`/vacancy/${vac.id}` as any)}>
                                                <Text className="text-slate-900 text-base font-extrabold">{vac.title}</Text>

                                                <View className="flex-row flex-wrap gap-3 mt-3 pt-2 border-t border-slate-100">
                                                    <View className="flex-row items-center gap-1">
                                                        <Text className="text-sm">{vac.country_flag || '🇸🇦'}</Text>
                                                        <Text className="text-slate-800 text-xs font-bold">{vac.target_country}</Text>
                                                    </View>
                                                    <View className="flex-row items-center gap-1">
                                                        <DollarSign size={12} color="#1E3A8A" />
                                                        <Text className="text-blue-900 text-xs font-black">{vac.salary_monthly}</Text>
                                                    </View>
                                                    <View className="flex-row items-center gap-1">
                                                        <Briefcase size={12} color="#64748B" />
                                                        <Text className="text-slate-600 text-xs font-medium">{vac.contract_type}</Text>
                                                    </View>
                                                </View>

                                                {/* Benefits Badges */}
                                                <View className="flex-row flex-wrap gap-1.5 mt-3">
                                                    {vac.benefits?.map((b: string, i: number) => (
                                                        <View key={i} className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex-row items-center gap-1">
                                                            <CheckCircle2 size={10} color="#059669" />
                                                            <Text className="text-emerald-800 text-[10px] font-bold">{b}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </Pressable>

                                            {/* Action Buttons: Inquire Chat, Full Specs & Quick Apply */}
                                            <View className="flex-row gap-2 mt-4 pt-3 border-t border-slate-100">
                                                <Pressable
                                                    onPress={() => openChatWithAgency(vac.agency_id || 'agency-1', vac.agency_name || 'Agency Support')}
                                                    className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center active:opacity-80"
                                                >
                                                    <MessageSquare size={16} color="#059669" />
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => router.push(`/vacancy/${vac.id}` as any)}
                                                    className="flex-1 bg-slate-100 border border-slate-200 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
                                                >
                                                    <Text className="text-slate-700 text-xs font-extrabold">Full Specs</Text>
                                                    <ChevronRight size={14} color="#475569" />
                                                </Pressable>

                                                <Pressable
                                                    onPress={() => { setApplyingVacancy(vac); setSuccess(false); }}
                                                    className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center flex-row justify-center gap-1 active:opacity-90 shadow-xs"
                                                >
                                                    <Send size={12} color="#FFFFFF" />
                                                    <Text className="text-white text-xs font-extrabold">Quick Apply</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                            <View className="h-20" />
                        </ScrollView>
                    )}
                </View>
            )}

            {/* Post Demand Order Modal (Employers) */}
            <Modal visible={showDemandModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-900 text-lg font-extrabold">Post Demand Order</Text>
                            <Pressable onPress={() => setShowDemandModal(false)} className="p-1 rounded-full bg-slate-100">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>
                        <Text className="text-slate-500 text-xs mb-4 font-medium">
                            Broadcast recruitment demand order to verified Ethiopian manpower agencies.
                        </Text>

                        <Text className="text-slate-700 text-xs font-bold mb-1">Order Title / Special Requirement</Text>
                        <TextInput
                            value={newDemandTitle}
                            onChangeText={setNewDemandTitle}
                            placeholder="e.g. 5x Housemaids with Arabic Cooking"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Worker Quantity</Text>
                        <TextInput
                            value={newDemandQuantity}
                            onChangeText={setNewDemandQuantity}
                            keyboardType="number-pad"
                            placeholder="3"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Monthly Salary Offer</Text>
                        <TextInput
                            value={newDemandSalary}
                            onChangeText={setNewDemandSalary}
                            placeholder="1,500 SAR ($400 USD)"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Target Country & City</Text>
                        <TextInput
                            value={newDemandCountry}
                            onChangeText={setNewDemandCountry}
                            placeholder="Saudi Arabia (Riyadh)"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-4"
                        />

                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => setShowDemandModal(false)}
                                className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                            >
                                <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleCreateDemandOrder}
                                className="flex-1 bg-amber-500 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                            >
                                <Text className="text-slate-950 text-xs font-black">Submit Order</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Quick Apply Modal (Job Seekers) */}
            <Modal visible={!!applyingVacancy} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        {success ? (
                            <View className="items-center py-4">
                                <CheckCircle2 size={48} color="#059669" />
                                <Text className="text-slate-900 text-lg font-extrabold mt-3">Application Submitted!</Text>
                                <Text className="text-slate-600 text-xs mt-1.5 text-center leading-5 font-medium">
                                    Your verified application for{'\n'}
                                    <Text className="text-emerald-700 font-bold">{applyingVacancy?.title}</Text>
                                    {'\n'}has been sent to {applyingVacancy?.agency_name}.
                                </Text>
                                <Pressable
                                    onPress={() => setApplyingVacancy(null)}
                                    className="mt-5 bg-emerald-600 py-3 px-8 rounded-xl active:opacity-90 shadow-xs"
                                >
                                    <Text className="text-white text-xs font-extrabold">Close</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center border border-emerald-200">
                                        <Briefcase size={20} color="#059669" />
                                    </View>
                                    <Pressable onPress={() => setApplyingVacancy(null)} className="p-1.5 bg-slate-100 rounded-full">
                                        <X size={18} color="#64748B" />
                                    </Pressable>
                                </View>

                                <Text className="text-slate-900 text-lg font-extrabold mt-1">Apply for Vacancy</Text>
                                <Text className="text-slate-600 text-xs mt-1 leading-5 font-medium">
                                    Submit your verified profile and GAMCA medical report for{'\n'}
                                    <Text className="text-blue-900 font-bold">{applyingVacancy?.title}</Text>?
                                </Text>

                                <View className="bg-slate-50 p-3 rounded-xl border border-slate-200 my-3 space-y-1">
                                    <Text className="text-[11px] font-bold text-slate-800">Target: {applyingVacancy?.target_country}</Text>
                                    <Text className="text-[11px] font-bold text-emerald-700">Salary: {applyingVacancy?.salary_monthly}</Text>
                                </View>

                                <View className="flex-row gap-3 mt-2">
                                    <Pressable
                                        onPress={() => setApplyingVacancy(null)}
                                        className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                                    >
                                        <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleApply}
                                        disabled={submitting}
                                        className="flex-1 bg-emerald-600 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                                    >
                                        <Text className="text-white text-xs font-extrabold">
                                            {submitting ? 'Submitting...' : 'Confirm Application'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

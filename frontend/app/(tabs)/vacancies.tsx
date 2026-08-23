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
} from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { vacancyService } from '../../services/vacancyService';
import { bookmarkService, SavedVacancy } from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function VacanciesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const { openChatWithAgency } = useChat();

    const [vacancies, setVacancies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [selectedCountry, setSelectedCountry] = useState('ALL');
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [applyingVacancy, setApplyingVacancy] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

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

    // Auto-reload vacancies and bookmarks on tab focus
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

    const filteredVacancies = vacancies.filter((vac) => {
        if (selectedCountry === 'ALL') return true;
        const target = (vac.target_country || vac.country_code || '').toLowerCase();
        return target.includes(selectedCountry.toLowerCase());
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-slate-900 text-xl font-extrabold">Find Job Vacancies</Text>
                        <Text className="text-slate-600 text-xs mt-0.5 font-medium">
                            Verified Gulf employment opportunities for Ethiopian workers
                        </Text>
                    </View>
                    <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center">
                        <ShieldCheck size={12} color="#059669" />
                        <Text className="text-emerald-800 text-[10px] font-extrabold ml-1 uppercase">MOLSA Approved</Text>
                    </View>
                </View>
            </View>

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

            {/* Apply Modal */}
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



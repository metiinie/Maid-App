import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Pressable,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Modal,
    Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
    ShieldCheck,
    ChevronRight,
    Bookmark,
    Trash2,
    Briefcase,
    Users,
    Search,
    MapPin,
    MessageSquare,
    Send,
    X,
    Building2,
    Calendar,
    DollarSign,
} from 'lucide-react-native';
import { bookmarkService, SavedVacancy, SavedCandidate } from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export default function SavedScreen() {
    const router = useRouter();
    const { activeWorkspace } = useAuth();
    const { openChatWithAgency } = useChat();
    const isEmployer = activeWorkspace?.type === 'GULF_EMPLOYER';

    const [activeSegment, setActiveSegment] = useState<'vacancies' | 'candidates'>(
        isEmployer ? 'candidates' : 'vacancies'
    );
    const [savedVacancies, setSavedVacancies] = useState<SavedVacancy[]>([]);
    const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    // Selection / Interview Request Modal
    const [selectedCandidateForHire, setSelectedCandidateForHire] = useState<SavedCandidate | null>(null);
    const [hireCity, setHireCity] = useState('Riyadh, Saudi Arabia');
    const [hireSalary, setHireSalary] = useState('1,500 SAR ($400 USD)');
    const [hireStartDate, setHireStartDate] = useState('Immediate / Next Flight');

    // Auto-reload saved items whenever tab comes into focus
    useFocusEffect(
        useCallback(() => {
            loadData(false);
        }, [])
    );

    async function loadData(showLoader = true) {
        if (showLoader) setLoading(true);
        try {
            const [vacs, cands] = await Promise.all([
                bookmarkService.getSavedVacancies(),
                bookmarkService.getSavedCandidates(),
            ]);

            // Add enterprise fallback candidate if empty for testing shortlist
            if (cands.length === 0 && isEmployer) {
                setSavedCandidates([
                    {
                        id: 'cand-101',
                        firstName: 'Alem',
                        lastName: 'Tadesse',
                        category: 'Housemaid & Cook',
                        yearsOfExperience: 3,
                        medicalStatus: 'Cleared',
                        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
                    },
                    {
                        id: 'cand-102',
                        firstName: 'Bethlehem',
                        lastName: 'Worku',
                        category: 'Nanny / Childcare Specialist',
                        yearsOfExperience: 2,
                        medicalStatus: 'Cleared',
                        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                    },
                ]);
            } else {
                setSavedCandidates(cands);
            }
            setSavedVacancies(vacs);
        } catch (e) {
            console.error('Failed to load saved items:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        loadData(false);
    };

    async function handleRemoveVacancy(id: string) {
        const item = savedVacancies.find((v) => v.id === id);
        if (item) {
            await bookmarkService.toggleSaveVacancy(item);
            setSavedVacancies((prev) => prev.filter((v) => v.id !== id));
        }
    }

    async function handleRemoveCandidate(id: string) {
        const item = savedCandidates.find((c) => c.id === id);
        if (item) {
            await bookmarkService.toggleSaveCandidate(item);
            setSavedCandidates((prev) => prev.filter((c) => c.id !== id));
        }
    }

    function handleConfirmSelectionRequest() {
        if (!selectedCandidateForHire) return;
        Alert.alert(
            'Selection Request Sent!',
            `Your formal recruitment request for ${selectedCandidateForHire.firstName} ${selectedCandidateForHire.lastName} has been sent to the managing agency.`
        );
        const cand = selectedCandidateForHire;
        setSelectedCandidateForHire(null);
        openChatWithAgency('agency-1', 'Ethio-Gulf Overseas Manpower Agency', 'candidate_inquiry', cand.id);
    }

    const filteredVacancies = savedVacancies.filter((v) => {
        const q = search.toLowerCase();
        return (
            v.title?.toLowerCase().includes(q) ||
            v.target_country?.toLowerCase().includes(q) ||
            v.agency_name?.toLowerCase().includes(q)
        );
    });

    const filteredCandidates = savedCandidates.filter((c) => {
        const q = search.toLowerCase();
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return fullName.includes(q) || c.category?.toLowerCase().includes(q);
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <Text className="text-xl font-extrabold text-slate-900 mb-3">
                    {isEmployer ? 'Employer Shortlist Hub' : 'Saved Bookmarks'}
                </Text>

                {/* Segmented Control */}
                <View className="flex-row bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <TouchableOpacity
                        onPress={() => setActiveSegment('candidates')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeSegment === 'candidates' ? 'bg-amber-500 shadow-xs' : ''}`}
                    >
                        <Text className={`text-xs font-black ${activeSegment === 'candidates' ? 'text-slate-950' : 'text-slate-700'}`}>
                            Shortlisted Candidates ({savedCandidates.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveSegment('vacancies')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeSegment === 'vacancies' ? 'bg-emerald-600 shadow-xs' : ''}`}
                    >
                        <Text className={`text-xs font-black ${activeSegment === 'vacancies' ? 'text-white' : 'text-slate-700'}`}>
                            Saved Jobs ({savedVacancies.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Input */}
            <View className="px-5 my-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder={
                            activeSegment === 'candidates'
                                ? 'Search shortlisted candidate, category...'
                                : 'Search saved jobs, agency, country...'
                        }
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView
                    className="flex-1 px-5"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                    showsVerticalScrollIndicator={false}
                >
                    {activeSegment === 'candidates' ? (
                        filteredCandidates.length === 0 ? (
                            <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                                <Users size={36} color="#94A3B8" />
                                <Text className="text-slate-900 text-sm font-black mt-3">No Shortlisted Candidates</Text>
                                <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                                    Bookmark candidate profiles in the Talent Search tab to manage your recruitment shortlist here.
                                </Text>
                                <Pressable
                                    onPress={() => router.push('/(tabs)/candidates')}
                                    className="mt-4 bg-amber-500 px-5 py-2.5 rounded-xl shadow-xs"
                                >
                                    <Text className="text-slate-950 text-xs font-black">Go to Talent Search →</Text>
                                </Pressable>
                            </View>
                        ) : (
                            filteredCandidates.map((c) => (
                                <View
                                    key={c.id}
                                    className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs"
                                >
                                    <View className="flex-row items-center justify-between mb-3">
                                        <TouchableOpacity
                                            onPress={() => router.push(`/candidate/${c.id}` as any)}
                                            className="flex-row items-center flex-1 mr-2"
                                        >
                                            <View className="w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center mr-3 border border-slate-800">
                                                <Text className="text-amber-400 text-base font-black">
                                                    {c.firstName?.[0]}{c.lastName?.[0]}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center">
                                                    <Text className="text-sm font-extrabold text-slate-900 mr-1.5">{c.firstName} {c.lastName}</Text>
                                                    <ShieldCheck size={14} color="#059669" />
                                                </View>
                                                <Text className="text-xs text-emerald-700 font-bold">{c.category} · {c.yearsOfExperience} yrs exp</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <Pressable
                                            onPress={() => handleRemoveCandidate(c.id)}
                                            className="p-1.5 bg-red-50 border border-red-200/60 rounded-lg active:opacity-80"
                                        >
                                            <Trash2 size={14} color="#DC2626" />
                                        </Pressable>
                                    </View>

                                    <View className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-row items-center justify-between my-1">
                                        <Text className="text-slate-500 text-[10px] font-bold">Medical Status:</Text>
                                        <View className="bg-emerald-100 px-2 py-0.5 rounded-md">
                                            <Text className="text-emerald-800 text-[10px] font-black uppercase">GAMCA Cleared</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center gap-2 pt-3 border-t border-slate-100">
                                        <Pressable
                                            onPress={() => router.push(`/candidate/${c.id}` as any)}
                                            className="flex-1 bg-slate-100 py-2.5 rounded-xl items-center active:opacity-80"
                                        >
                                            <Text className="text-slate-900 text-xs font-bold">Full Profile</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => setSelectedCandidateForHire(c)}
                                            className="flex-1 bg-slate-900 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-90 shadow-xs"
                                        >
                                            <Briefcase size={14} color="#F59E0B" />
                                            <Text className="text-amber-400 text-xs font-extrabold">Inquire / Hire</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))
                        )
                    ) : filteredVacancies.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Briefcase size={36} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-black mt-3">No Saved Vacancies</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                                Tap the heart icon on job vacancies to save them here for easy access.
                            </Text>
                            <Pressable
                                onPress={() => router.push('/(tabs)/vacancies')}
                                className="mt-4 bg-emerald-600 px-5 py-2.5 rounded-xl shadow-xs"
                            >
                                <Text className="text-white text-xs font-bold">Browse Job Vacancies →</Text>
                            </Pressable>
                        </View>
                    ) : (
                        filteredVacancies.map((v) => (
                            <View
                                key={v.id}
                                className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs"
                            >
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-xs font-extrabold text-emerald-700">{v.agency_name || 'Overseas Recruitment'}</Text>
                                    <Pressable
                                        onPress={() => handleRemoveVacancy(v.id)}
                                        className="p-1.5 bg-red-50 border border-red-200/60 rounded-lg active:opacity-80"
                                    >
                                        <Trash2 size={14} color="#DC2626" />
                                    </Pressable>
                                </View>

                                <TouchableOpacity
                                    onPress={() => router.push(`/vacancy/${v.id}` as any)}
                                    className="mb-3"
                                >
                                    <Text className="text-base font-extrabold text-slate-900">{v.title}</Text>
                                    <View className="flex-row items-center gap-4 mt-2">
                                        <View className="flex-row items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                                            <MapPin size={12} color="#64748B" />
                                            <Text className="text-slate-700 text-[11px] font-bold">{v.target_country}</Text>
                                        </View>
                                        <Text className="text-xs font-extrabold text-emerald-700">{v.salary_monthly}</Text>
                                    </View>
                                </TouchableOpacity>

                                <View className="flex-row items-center gap-2 pt-3 border-t border-slate-100">
                                    <Pressable
                                        onPress={() => router.push(`/vacancy/${v.id}` as any)}
                                        className="flex-1 bg-slate-100 py-2.5 rounded-xl items-center active:opacity-80"
                                    >
                                        <Text className="text-slate-900 text-xs font-bold">View Details</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => Alert.alert('Application Submitted', 'Your candidate profile was sent to the agency.')}
                                        className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-90 shadow-xs"
                                    >
                                        <Send size={12} color="#FFFFFF" />
                                        <Text className="text-white text-xs font-extrabold">Quick Apply</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* Selection / Interview Request Modal */}
            <Modal visible={!!selectedCandidateForHire} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-slate-900 text-lg font-extrabold">Selection Request</Text>
                            <Pressable onPress={() => setSelectedCandidateForHire(null)} className="p-1 rounded-full bg-slate-100">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>
                        <Text className="text-emerald-700 text-xs font-bold mb-3">
                            Candidate: {selectedCandidateForHire?.firstName} {selectedCandidateForHire?.lastName} ({selectedCandidateForHire?.category})
                        </Text>
                        <Text className="text-slate-500 text-xs mb-4 font-medium">
                            Submit formal selection request to the managing agency for visa & medical processing.
                        </Text>

                        <Text className="text-slate-700 text-xs font-bold mb-1">Target Destination City</Text>
                        <TextInput
                            value={hireCity}
                            onChangeText={setHireCity}
                            placeholder="Riyadh, Saudi Arabia"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Monthly Salary Offer</Text>
                        <TextInput
                            value={hireSalary}
                            onChangeText={setHireSalary}
                            placeholder="1,500 SAR ($400 USD)"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Target Start Date</Text>
                        <TextInput
                            value={hireStartDate}
                            onChangeText={setHireStartDate}
                            placeholder="Immediate / Next Flight"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-4"
                        />

                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => setSelectedCandidateForHire(null)}
                                className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                            >
                                <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleConfirmSelectionRequest}
                                className="flex-1 bg-amber-500 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                            >
                                <Text className="text-slate-950 text-xs font-black">Confirm Request</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

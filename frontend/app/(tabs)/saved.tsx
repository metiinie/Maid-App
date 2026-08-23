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
            setSavedVacancies(vacs);
            setSavedCandidates(cands);
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
                <Text className="text-xl font-extrabold text-slate-900 mb-3">Saved Bookmarks</Text>

                {/* Segmented Control */}
                <View className="flex-row bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <TouchableOpacity
                        onPress={() => setActiveSegment('vacancies')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeSegment === 'vacancies' ? 'bg-emerald-600 shadow-xs' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${activeSegment === 'vacancies' ? 'text-white' : 'text-slate-700'}`}>
                            Saved Jobs ({savedVacancies.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveSegment('candidates')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeSegment === 'candidates' ? 'bg-emerald-600 shadow-xs' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${activeSegment === 'candidates' ? 'text-white' : 'text-slate-700'}`}>
                            Candidates ({savedCandidates.length})
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
                            activeSegment === 'vacancies'
                                ? 'Search saved jobs, agency, country...'
                                : 'Search saved candidates, category...'
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
                    {activeSegment === 'vacancies' ? (
                        filteredVacancies.length === 0 ? (
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
                        )
                    ) : filteredCandidates.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Users size={36} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-black mt-3">No Saved Candidates</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                                Bookmark profiles to revisit candidate profiles later.
                            </Text>
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
                                        <Image
                                            source={{ uri: c.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' }}
                                            className="w-12 h-12 rounded-2xl mr-3 border border-slate-200"
                                        />
                                        <View className="flex-1">
                                            <View className="flex-row items-center">
                                                <Text className="text-sm font-extrabold text-slate-900 mr-1.5">{c.firstName} {c.lastName}</Text>
                                                <ShieldCheck size={14} color="#059669" />
                                            </View>
                                            <Text className="text-xs text-slate-600 font-medium">{c.category} · {c.yearsOfExperience} yrs exp</Text>
                                        </View>
                                    </TouchableOpacity>

                                    <Pressable
                                        onPress={() => handleRemoveCandidate(c.id)}
                                        className="p-1.5 bg-red-50 border border-red-200/60 rounded-lg active:opacity-80"
                                    >
                                        <Trash2 size={14} color="#DC2626" />
                                    </Pressable>
                                </View>

                                <View className="flex-row items-center gap-2 pt-3 border-t border-slate-100">
                                    <Pressable
                                        onPress={() => router.push(`/candidate/${c.id}` as any)}
                                        className="flex-1 bg-slate-100 py-2.5 rounded-xl items-center active:opacity-80"
                                    >
                                        <Text className="text-slate-900 text-xs font-bold">Full Profile</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => openChatWithAgency('agency-1', 'Agency Support', 'candidate_inquiry', c.id)}
                                        className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-90 shadow-xs"
                                    >
                                        <MessageSquare size={12} color="#FFFFFF" />
                                        <Text className="text-white text-xs font-extrabold">Inquire / Hire</Text>
                                    </Pressable>
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



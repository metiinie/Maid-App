import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, ChevronRight, Bookmark, Trash2, Briefcase, Users } from 'lucide-react-native';
import { bookmarkService, SavedVacancy, SavedCandidate } from '../../services/bookmarkService';
import { useAuth } from '../../context/AuthContext';

export default function SavedScreen() {
    const router = useRouter();
    const { activeWorkspace } = useAuth();
    const isEmployer = activeWorkspace?.type === 'GULF_EMPLOYER';

    const [activeSegment, setActiveSegment] = useState<'vacancies' | 'candidates'>(
        isEmployer ? 'candidates' : 'vacancies'
    );
    const [savedVacancies, setSavedVacancies] = useState<SavedVacancy[]>([]);
    const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
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
        }
    }

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

            <ScrollView className="flex-1 p-5">
                {activeSegment === 'vacancies' ? (
                    savedVacancies.length === 0 ? (
                        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-6 shadow-xs">
                            <Briefcase size={36} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-black mt-3">No Saved Vacancies</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                                Tap the heart icon on job vacancies to save them here for easy access.
                            </Text>
                            <Pressable
                                onPress={() => router.push('/(tabs)/vacancies')}
                                className="mt-4 bg-emerald-600 px-5 py-2.5 rounded-xl"
                            >
                                <Text className="text-white text-xs font-bold">Browse Job Vacancies →</Text>
                            </Pressable>
                        </View>
                    ) : (
                        savedVacancies.map((v) => (
                            <View
                                key={v.id}
                                className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs flex-row items-center justify-between"
                            >
                                <TouchableOpacity
                                    onPress={() => router.push(`/vacancy/${v.id}` as any)}
                                    className="flex-1 mr-3"
                                >
                                    <Text className="text-xs font-bold text-emerald-700 mb-0.5">{v.agency_name || 'Overseas Agency'}</Text>
                                    <Text className="text-base font-bold text-slate-900">{v.title}</Text>
                                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                        <Text className="text-xs font-extrabold text-blue-900">{v.salary_monthly}</Text>
                                        <Text className="text-xs font-bold text-slate-600">{v.target_country}</Text>
                                    </View>
                                </TouchableOpacity>

                                <Pressable
                                    onPress={() => handleRemoveVacancy(v.id)}
                                    className="p-2.5 bg-red-50 border border-red-200/60 rounded-xl"
                                >
                                    <Trash2 size={16} color="#DC2626" />
                                </Pressable>
                            </View>
                        ))
                    )
                ) : savedCandidates.length === 0 ? (
                    <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center mt-6 shadow-xs">
                        <Users size={36} color="#94A3B8" />
                        <Text className="text-slate-900 text-sm font-black mt-3">No Saved Candidates</Text>
                        <Text className="text-slate-500 text-xs text-center mt-1 font-medium leading-5">
                            Bookmark profiles to revisit shortlist candidate profiles.
                        </Text>
                    </View>
                ) : (
                    savedCandidates.map((c) => (
                        <View
                            key={c.id}
                            className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 flex-row items-center justify-between shadow-xs"
                        >
                            <TouchableOpacity
                                onPress={() => router.push(`/candidate/${c.id}` as any)}
                                className="flex-row items-center flex-1 mr-2"
                            >
                                <Image
                                    source={{ uri: c.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400' }}
                                    className="w-12 h-12 rounded-full mr-3 border border-slate-200"
                                />
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-sm font-bold text-slate-900 mr-1.5">{c.firstName} {c.lastName}</Text>
                                        <ShieldCheck size={14} color="#059669" />
                                    </View>
                                    <Text className="text-xs text-slate-600 font-medium">{c.category} · {c.yearsOfExperience} yrs exp</Text>
                                </View>
                            </TouchableOpacity>

                            <Pressable
                                onPress={() => handleRemoveCandidate(c.id)}
                                className="p-2.5 bg-red-50 border border-red-200/60 rounded-xl"
                            >
                                <Trash2 size={16} color="#DC2626" />
                            </Pressable>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}


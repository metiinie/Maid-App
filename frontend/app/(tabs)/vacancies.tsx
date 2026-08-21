import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Briefcase, MapPin, DollarSign, CheckCircle, X } from 'lucide-react-native';
import { vacancyService } from '../../services/vacancyService';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function VacanciesScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const [vacancies, setVacancies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [applyingVacancy, setApplyingVacancy] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchVacancies();
    }, []);

    async function fetchVacancies() {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            const res: any = await vacancyService.getPublicVacancies(params);
            setVacancies(res.data || []);
        } catch (err) {
            console.error('Failed to fetch vacancies:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleApply() {
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to apply for jobs.', [
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

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <Text className="text-slate-900 text-xl font-extrabold">Job Vacancies</Text>
                <Text className="text-slate-600 text-xs mt-0.5 font-medium">
                    Gulf employment opportunities for Ethiopian workers
                </Text>
            </View>

            {/* Search */}
            <View className="px-5 my-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={fetchVacancies}
                        placeholder="Search by job title..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Job Cards */}
            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {vacancies.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Briefcase size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No vacancies found</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">Try searching for a different job title or specialty.</Text>
                        </View>
                    ) : (
                        vacancies.map((vac: any) => (
                            <Pressable
                                key={vac.id}
                                onPress={() => { setApplyingVacancy(vac); setSuccess(false); }}
                                className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs active:opacity-90"
                            >
                                <Text className="text-slate-900 text-sm font-bold">{vac.title}</Text>
                                <Text className="text-emerald-700 text-xs font-bold mt-0.5">
                                    {vac.agency_name || 'Accredited Agency'}
                                </Text>
                                <View className="flex-row flex-wrap gap-3 mt-3 pt-2 border-t border-slate-100">
                                    <View className="flex-row items-center gap-1">
                                        <MapPin size={12} color="#059669" />
                                        <Text className="text-slate-700 text-xs font-medium">{vac.target_country || 'Saudi Arabia'}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <DollarSign size={12} color="#1E3A8A" />
                                        <Text className="text-blue-900 text-xs font-bold">{vac.salary_monthly || '400'} {vac.currency || 'USD'}/mo</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Briefcase size={12} color="#64748B" />
                                        <Text className="text-slate-600 text-xs font-medium">{vac.contract_type || '2-Year Contract'}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))
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
                                <CheckCircle size={44} color="#059669" />
                                <Text className="text-slate-900 text-lg font-extrabold mt-3">Application Sent!</Text>
                                <Text className="text-slate-600 text-xs mt-1.5 text-center leading-5 font-medium">
                                    Your application for{'\n'}
                                    <Text className="text-emerald-700 font-bold">{applyingVacancy?.title}</Text>
                                    {'\n'}has been submitted to the recruitment agency.
                                </Text>
                                <Pressable
                                    onPress={() => setApplyingVacancy(null)}
                                    className="mt-5 bg-emerald-600 py-3 px-8 rounded-xl active:opacity-90"
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
                                <Text className="text-slate-900 text-lg font-extrabold mt-1">Apply for Job</Text>
                                <Text className="text-slate-600 text-xs mt-1 leading-5 font-medium">
                                    Submit your verified candidate profile for{'\n'}
                                    <Text className="text-blue-900 font-bold">{applyingVacancy?.title}</Text>?
                                </Text>
                                <View className="flex-row gap-3 mt-5">
                                    <Pressable
                                        onPress={() => setApplyingVacancy(null)}
                                        className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                                    >
                                        <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleApply}
                                        disabled={submitting}
                                        className="flex-1 bg-emerald-600 py-3 rounded-xl items-center active:opacity-90"
                                    >
                                        <Text className="text-white text-xs font-extrabold">
                                            {submitting ? 'Sending...' : 'Confirm'}
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

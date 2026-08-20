import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Briefcase, MapPin, DollarSign, CheckCircle } from 'lucide-react-native';
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
        <View className="flex-1 bg-ethiopia-navy">
            {/* Header */}
            <View className="px-5 pt-14 pb-4">
                <Text className="text-white text-xl font-extrabold">Job Vacancies</Text>
                <Text className="text-slate-400 text-[11px] mt-0.5">
                    Gulf employment opportunities for Ethiopian workers
                </Text>
            </View>

            {/* Search */}
            <View className="px-5 mb-4">
                <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-1">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={fetchVacancies}
                        placeholder="Search by job title..."
                        placeholderTextColor="#64748B"
                        className="flex-1 text-white text-xs ml-2.5 py-3"
                        returnKeyType="search"
                    />
                </View>
            </View>

            {/* Job Cards */}
            {loading ? (
                <ActivityIndicator color="#D4AF37" size="large" className="mt-10" />
            ) : (
                <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                    {vacancies.length === 0 ? (
                        <View className="items-center py-16">
                            <Briefcase size={32} color="#475569" />
                            <Text className="text-slate-400 text-xs mt-3">No vacancies found</Text>
                        </View>
                    ) : (
                        vacancies.map((vac: any) => (
                            <Pressable
                                key={vac.id}
                                onPress={() => { setApplyingVacancy(vac); setSuccess(false); }}
                                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-3 active:opacity-80"
                            >
                                <Text className="text-white text-sm font-bold">{vac.title}</Text>
                                <Text className="text-ethiopia-gold text-[11px] font-semibold mt-1">
                                    {vac.agency_name || 'Accredited Agency'}
                                </Text>
                                <View className="flex-row flex-wrap gap-3 mt-2.5">
                                    <View className="flex-row items-center gap-1">
                                        <MapPin size={11} color="#64748B" />
                                        <Text className="text-slate-400 text-[10px]">{vac.target_country || 'UAE'}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <DollarSign size={11} color="#64748B" />
                                        <Text className="text-slate-400 text-[10px]">{vac.salary_monthly || 'N/A'} {vac.currency || 'USD'}/mo</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1">
                                        <Briefcase size={11} color="#64748B" />
                                        <Text className="text-slate-400 text-[10px]">{vac.contract_type || 'Full-time'}</Text>
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
                <View className="flex-1 bg-black/70 justify-center items-center p-5">
                    <View className="bg-ethiopia-navy-light border border-slate-800 rounded-3xl p-6 w-full max-w-sm">
                        {success ? (
                            <View className="items-center py-4">
                                <CheckCircle size={40} color="#10B981" />
                                <Text className="text-white text-lg font-extrabold mt-3">Application Sent!</Text>
                                <Text className="text-slate-300 text-xs mt-1.5 text-center leading-5">
                                    Your application for{'\n'}
                                    <Text className="text-ethiopia-gold font-bold">{applyingVacancy?.title}</Text>
                                    {'\n'}has been submitted.
                                </Text>
                                <Pressable
                                    onPress={() => setApplyingVacancy(null)}
                                    className="mt-5 bg-ethiopia-gold py-3 px-8 rounded-2xl"
                                >
                                    <Text className="text-ethiopia-navy text-xs font-extrabold">Close</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View>
                                <Briefcase size={28} color="#D4AF37" />
                                <Text className="text-white text-lg font-extrabold mt-3">Apply for Job</Text>
                                <Text className="text-slate-300 text-xs mt-1.5 leading-5">
                                    Submit your verified profile for{'\n'}
                                    <Text className="text-ethiopia-gold font-bold">{applyingVacancy?.title}</Text>?
                                </Text>
                                <View className="flex-row gap-3 mt-5">
                                    <Pressable
                                        onPress={() => setApplyingVacancy(null)}
                                        className="flex-1 bg-slate-900 border border-slate-800 py-3 rounded-2xl items-center"
                                    >
                                        <Text className="text-slate-300 text-xs font-bold">Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleApply}
                                        disabled={submitting}
                                        className="flex-1 bg-ethiopia-gold py-3 rounded-2xl items-center"
                                    >
                                        <Text className="text-ethiopia-navy text-xs font-extrabold">
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

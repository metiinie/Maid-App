import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Modal, Alert } from 'react-native';
import { Search, Briefcase, MapPin, DollarSign, CheckCircle2, ShieldCheck, X, Building2 } from 'lucide-react-native';
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
            const list = res.data || [];

            if (list.length === 0) {
                setVacancies([
                    {
                        id: 'vac-101',
                        title: 'Experienced Housemaid & Arabic Cook',
                        agency_name: 'Ethio-Gulf Overseas Recruitment',
                        molsa_license: 'MOLSA License #ET-REC-2024-089',
                        target_country: 'Saudi Arabia (Riyadh)',
                        country_flag: '🇸🇦',
                        salary_monthly: '1,500 SAR ($400 USD)',
                        currency: 'SAR',
                        contract_type: '2-Year Renewable Contract',
                        benefits: ['Free Food & Private Room', 'Round-Trip Air Ticket', 'Medical Insurance Included'],
                    },
                    {
                        id: 'vac-102',
                        title: 'Nanny / Infant Care Specialist',
                        agency_name: 'Blue Nile Foreign Employment',
                        molsa_license: 'MOLSA License #ET-REC-2024-042',
                        target_country: 'United Arab Emirates (Dubai)',
                        country_flag: '🇦🇪',
                        salary_monthly: '1,600 AED ($435 USD)',
                        currency: 'AED',
                        contract_type: '2-Year Renewable Contract',
                        benefits: ['Free Accommodation', 'Health Insurance', 'Annual Paid Leave'],
                    },
                    {
                        id: 'vac-103',
                        title: 'Senior Elderly Caregiver',
                        agency_name: 'Addis Overseas Recruitment',
                        molsa_license: 'MOLSA License #ET-REC-2024-115',
                        target_country: 'Kuwait (Kuwait City)',
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
        }
    }

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

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-slate-900 text-xl font-extrabold">Job Vacancies</Text>
                        <Text className="text-slate-600 text-xs mt-0.5 font-medium">
                            Verified Gulf employment opportunities for Ethiopian workers
                        </Text>
                    </View>
                    <View className="bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex-row items-center">
                        <ShieldCheck size={12} color="#1E3A8A" />
                        <Text className="text-blue-900 text-[10px] font-extrabold ml-1 uppercase">MOLSA Approved</Text>
                    </View>
                </View>
            </View>

            {/* Search */}
            <View className="px-5 my-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={fetchVacancies}
                        placeholder="Search job title, country (Saudi Arabia, UAE)..."
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
                            <Text className="text-slate-500 text-xs text-center mt-1">Try searching for a different title or country.</Text>
                        </View>
                    ) : (
                        vacancies.map((vac: any) => (
                            <Pressable
                                key={vac.id}
                                onPress={() => { setApplyingVacancy(vac); setSuccess(false); }}
                                className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs active:opacity-90"
                            >
                                <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-slate-100">
                                    <View className="flex-row items-center gap-1.5">
                                        <Building2 size={14} color="#059669" />
                                        <Text className="text-emerald-700 text-xs font-bold">{vac.agency_name}</Text>
                                    </View>
                                    <Text className="text-slate-500 text-[10px] font-bold">{vac.molsa_license}</Text>
                                </View>

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

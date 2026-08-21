import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Modal } from 'react-native';
import { Search, Filter, Users, MapPin, Star, X, Send } from 'lucide-react-native';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';

export default function CandidatesScreen() {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [inquiryText, setInquiryText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCandidates();
    }, []);

    async function fetchCandidates() {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            const res: any = await candidateService.getPublicCandidates(params);
            setCandidates(res.data || []);
        } catch (err) {
            console.error('Failed to fetch candidates:', err);
        } finally {
            setLoading(false);
        }
    }

    async function submitInquiry() {
        if (!selectedCandidate || !inquiryText.trim()) return;
        setSubmitting(true);
        try {
            await candidateService.submitInquiry(selectedCandidate.id, {
                message: inquiryText,
                contact_phone: user?.phone || '+251900000000',
            });
            setSelectedCandidate(null);
            setInquiryText('');
        } catch (err: any) {
            console.error('Inquiry failed:', err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <Text className="text-slate-900 text-xl font-extrabold">Candidate Directory</Text>
                <Text className="text-slate-600 text-xs mt-0.5 font-medium">
                    Browse verified Ethiopian manpower profiles
                </Text>
            </View>

            {/* Search Bar */}
            <View className="px-5 my-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={fetchCandidates}
                        placeholder="Search by name, skill..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                        returnKeyType="search"
                    />
                    <Pressable onPress={fetchCandidates} className="ml-2 p-2 bg-emerald-600 rounded-xl">
                        <Filter size={14} color="#FFFFFF" />
                    </Pressable>
                </View>
            </View>

            {/* Candidate List */}
            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {candidates.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Users size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No candidates match your search</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">Try adjusting your search criteria or clear the search bar.</Text>
                        </View>
                    ) : (
                        candidates.map((cand: any) => (
                            <Pressable
                                key={cand.id}
                                onPress={() => setSelectedCandidate(cand)}
                                className="bg-white border border-slate-200 rounded-2xl p-4 mb-3 shadow-xs active:opacity-90"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center border border-blue-200">
                                        <Text className="text-blue-900 text-base font-bold">
                                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 text-sm font-bold">
                                            {cand.first_name} {cand.last_name}
                                        </Text>
                                        <Text className="text-emerald-700 text-xs font-bold mt-0.5">
                                            {cand.category_name || 'Housemaid'}
                                        </Text>
                                        <View className="flex-row items-center gap-3 mt-1.5">
                                            <Text className="text-slate-600 text-[11px] font-medium">Age: {cand.age || '24'}</Text>
                                            <Text className="text-slate-600 text-[11px] font-medium">Exp: {cand.years_experience || '3'}yr</Text>
                                            <View className="flex-row items-center gap-0.5">
                                                <MapPin size={10} color="#059669" />
                                                <Text className="text-slate-600 text-[11px] font-medium">{cand.nationality || 'Ethiopian'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {cand.is_featured && (
                                        <View className="bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                                            <Star size={12} color="#059669" fill="#059669" />
                                        </View>
                                    )}
                                </View>
                            </Pressable>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* Candidate Detail + Inquiry Modal */}
            <Modal visible={!!selectedCandidate} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-3xl border-t border-slate-200 p-5 max-h-[80%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-slate-900 text-lg font-extrabold">Candidate Profile</Text>
                            <Pressable onPress={() => setSelectedCandidate(null)} className="p-1.5 bg-slate-100 rounded-full">
                                <X size={20} color="#64748B" />
                            </Pressable>
                        </View>

                        {selectedCandidate && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-4">
                                    <View className="w-20 h-20 rounded-2xl bg-blue-100 border border-blue-200 items-center justify-center mb-3">
                                        <Text className="text-blue-900 text-2xl font-bold">
                                            {selectedCandidate.first_name?.[0]}{selectedCandidate.last_name?.[0]}
                                        </Text>
                                    </View>
                                    <Text className="text-slate-900 text-lg font-extrabold">
                                        {selectedCandidate.first_name} {selectedCandidate.last_name}
                                    </Text>
                                    <Text className="text-emerald-700 text-xs font-bold mt-0.5">
                                        {selectedCandidate.category_name || 'Housemaid'}
                                    </Text>
                                </View>

                                {/* Info Grid */}
                                <View className="flex-row flex-wrap gap-2 mb-5">
                                    {[
                                        { label: 'Age', value: selectedCandidate.age || '24' },
                                        { label: 'Gender', value: selectedCandidate.gender || 'Female' },
                                        { label: 'Experience', value: `${selectedCandidate.years_experience || '3'} years` },
                                        { label: 'Religion', value: selectedCandidate.religion || 'Christian' },
                                        { label: 'Medical', value: selectedCandidate.medical_status || 'Cleared' },
                                        { label: 'Passport', value: selectedCandidate.passport_number || 'ET-XXXXX' },
                                    ].map((item) => (
                                        <View key={item.label} className="flex-1 min-w-[45%] bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                            <Text className="text-slate-500 text-[10px] font-semibold">{item.label}</Text>
                                            <Text className="text-slate-900 text-xs font-bold mt-0.5">{item.value}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Inquiry Form */}
                                <Text className="text-slate-900 text-sm font-bold mb-2">Send Inquiry</Text>
                                <TextInput
                                    value={inquiryText}
                                    onChangeText={setInquiryText}
                                    placeholder="Write your inquiry message..."
                                    placeholderTextColor="#94A3B8"
                                    multiline
                                    numberOfLines={3}
                                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 text-xs mb-3"
                                    textAlignVertical="top"
                                />
                                <Pressable
                                    onPress={submitInquiry}
                                    disabled={submitting || !inquiryText.trim()}
                                    className="bg-emerald-600 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-90"
                                >
                                    <Send size={14} color="#FFFFFF" />
                                    <Text className="text-white text-xs font-extrabold">
                                        {submitting ? 'Sending...' : 'Submit Inquiry'}
                                    </Text>
                                </Pressable>
                                <View className="h-10" />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

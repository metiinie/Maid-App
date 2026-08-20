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
        <View className="flex-1 bg-ethiopia-navy">
            {/* Header */}
            <View className="px-5 pt-14 pb-4">
                <Text className="text-white text-xl font-extrabold">Candidate Directory</Text>
                <Text className="text-slate-400 text-[11px] mt-0.5">
                    Browse verified Ethiopian manpower profiles
                </Text>
            </View>

            {/* Search Bar */}
            <View className="px-5 mb-4">
                <View className="flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-1">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={fetchCandidates}
                        placeholder="Search by name, skill..."
                        placeholderTextColor="#64748B"
                        className="flex-1 text-white text-xs ml-2.5 py-3"
                        returnKeyType="search"
                    />
                    <Pressable onPress={fetchCandidates} className="ml-2 p-1.5 bg-ethiopia-gold rounded-lg">
                        <Filter size={14} color="#0A192F" />
                    </Pressable>
                </View>
            </View>

            {/* Candidate List */}
            {loading ? (
                <ActivityIndicator color="#D4AF37" size="large" className="mt-10" />
            ) : (
                <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                    {candidates.length === 0 ? (
                        <View className="items-center py-16">
                            <Users size={32} color="#475569" />
                            <Text className="text-slate-400 text-xs mt-3">No candidates match your search</Text>
                        </View>
                    ) : (
                        candidates.map((cand: any) => (
                            <Pressable
                                key={cand.id}
                                onPress={() => setSelectedCandidate(cand)}
                                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-3 active:opacity-80"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="w-12 h-12 rounded-xl bg-ethiopia-gold/15 items-center justify-center">
                                        <Text className="text-ethiopia-gold text-base font-bold">
                                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-sm font-bold">
                                            {cand.first_name} {cand.last_name}
                                        </Text>
                                        <Text className="text-ethiopia-gold text-[11px] font-semibold mt-0.5">
                                            {cand.category_name || 'Housemaid'}
                                        </Text>
                                        <View className="flex-row items-center gap-3 mt-1.5">
                                            <Text className="text-slate-400 text-[10px]">Age: {cand.age || '24'}</Text>
                                            <Text className="text-slate-400 text-[10px]">Exp: {cand.years_experience || '3'}yr</Text>
                                            <View className="flex-row items-center gap-0.5">
                                                <MapPin size={9} color="#64748B" />
                                                <Text className="text-slate-400 text-[10px]">{cand.nationality || 'Ethiopian'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {cand.is_featured && (
                                        <View className="bg-ethiopia-gold/15 border border-ethiopia-gold/25 px-2 py-1 rounded-lg">
                                            <Star size={12} color="#D4AF37" fill="#D4AF37" />
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
                <View className="flex-1 bg-black/70 justify-end">
                    <View className="bg-ethiopia-navy-light rounded-t-3xl border-t border-slate-800 p-5 max-h-[80%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white text-lg font-extrabold">Candidate Profile</Text>
                            <Pressable onPress={() => setSelectedCandidate(null)} className="p-1.5">
                                <X size={20} color="#94A3B8" />
                            </Pressable>
                        </View>

                        {selectedCandidate && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-4">
                                    <View className="w-20 h-20 rounded-2xl bg-ethiopia-gold/15 items-center justify-center mb-3">
                                        <Text className="text-ethiopia-gold text-2xl font-bold">
                                            {selectedCandidate.first_name?.[0]}{selectedCandidate.last_name?.[0]}
                                        </Text>
                                    </View>
                                    <Text className="text-white text-lg font-extrabold">
                                        {selectedCandidate.first_name} {selectedCandidate.last_name}
                                    </Text>
                                    <Text className="text-ethiopia-gold text-xs font-bold mt-0.5">
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
                                        <View key={item.label} className="flex-1 min-w-[45%] bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                            <Text className="text-slate-400 text-[10px] font-semibold">{item.label}</Text>
                                            <Text className="text-white text-xs font-bold mt-0.5">{item.value}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Inquiry Form */}
                                <Text className="text-white text-sm font-bold mb-2">Send Inquiry</Text>
                                <TextInput
                                    value={inquiryText}
                                    onChangeText={setInquiryText}
                                    placeholder="Write your inquiry message..."
                                    placeholderTextColor="#64748B"
                                    multiline
                                    numberOfLines={3}
                                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs mb-3"
                                    textAlignVertical="top"
                                />
                                <Pressable
                                    onPress={submitInquiry}
                                    disabled={submitting || !inquiryText.trim()}
                                    className="bg-ethiopia-gold py-3.5 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
                                >
                                    <Send size={14} color="#0A192F" />
                                    <Text className="text-ethiopia-navy text-xs font-extrabold">
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

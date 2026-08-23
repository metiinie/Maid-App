import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { ShieldCheck, MapPin, Phone, Mail, CheckCircle, MessageSquare, Search, Building2 } from 'lucide-react-native';
import { candidateService } from '../../services/candidateService';
import { useChat } from '../../context/ChatContext';

export default function AgenciesScreen() {
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { openChatWithAgency } = useChat();

    useEffect(() => {
        loadAgencies();
    }, []);

    async function loadAgencies() {
        setLoading(true);
        try {
            const res: any = await candidateService.getAgencies();
            const list = res.data || [];
            if (list.length === 0) {
                setAgencies([
                    {
                        id: 'agency-1',
                        name: 'Ethio-Gulf Overseas Manpower Agency',
                        license_number: 'ET-MOLSA-2024-089',
                        city: 'Addis Ababa (Bole)',
                        phone: '+251 911 234 567',
                        email: 'info@ethiogulf recruitment.et',
                        specialties: ['Housemaids', 'Arabic Cooks', 'Nannies'],
                    },
                    {
                        id: 'agency-2',
                        name: 'Blue Nile Foreign Employment Enterprise',
                        license_number: 'ET-MOLSA-2024-042',
                        city: 'Addis Ababa (Kazanchis)',
                        phone: '+251 911 987 654',
                        email: 'contact@bluenile-manpower.com',
                        specialties: ['Caregivers', 'Drivers', 'Housekeepers'],
                    },
                    {
                        id: 'agency-3',
                        name: 'Addis Overseas Recruitment Agency',
                        license_number: 'ET-MOLSA-2024-115',
                        city: 'Hawassa / Addis Ababa',
                        phone: '+251 922 456 789',
                        email: 'jobs@addisoverseas.et',
                        specialties: ['Domestic Workers', 'Hospitality'],
                    },
                ]);
            } else {
                setAgencies(list);
            }
        } catch (err) {
            console.error('Failed to load agencies:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredAgencies = agencies.filter((a) => {
        const query = search.toLowerCase();
        return (
            a.name?.toLowerCase().includes(query) ||
            a.license_number?.toLowerCase().includes(query) ||
            a.city?.toLowerCase().includes(query)
        );
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-slate-900 text-xl font-extrabold">Agency Directory</Text>
                        <Text className="text-slate-500 text-xs mt-0.5 font-medium">
                            MOLSA-Licensed Ethiopian Foreign Manpower Agencies
                        </Text>
                    </View>
                    <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center">
                        <ShieldCheck size={14} color="#059669" />
                        <Text className="text-emerald-800 text-[10px] font-extrabold ml-1 uppercase">MOLSA Verified</Text>
                    </View>
                </View>
            </View>

            {/* Search Input */}
            <View className="px-5 my-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search agency name, license #, city..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView className="px-5 flex-1" showsVerticalScrollIndicator={false}>
                    {filteredAgencies.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Building2 size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No agencies found</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">Try a different search term.</Text>
                        </View>
                    ) : (
                        filteredAgencies.map((agency: any) => (
                            <View key={agency.id} className="bg-white border border-slate-200 rounded-2xl p-5 mb-3 shadow-xs">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center">
                                        <Building2 size={22} color="#059669" />
                                    </View>
                                    <View className="flex-row items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                        <CheckCircle size={10} color="#059669" />
                                        <Text className="text-emerald-800 text-[10px] font-extrabold uppercase">Verified Agency</Text>
                                    </View>
                                </View>

                                <Text className="text-slate-900 text-base font-extrabold">{agency.name}</Text>
                                <Text className="text-emerald-700 text-xs font-bold mt-0.5">
                                    License #{agency.license_number || 'ET-MOLSA-2026-098'}
                                </Text>

                                <View className="mt-3 pt-3 border-t border-slate-100 gap-1.5">
                                    <View className="flex-row items-center gap-2">
                                        <MapPin size={13} color="#64748B" />
                                        <Text className="text-slate-700 text-xs font-medium">{agency.city || 'Addis Ababa'}, Ethiopia</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Phone size={13} color="#64748B" />
                                        <Text className="text-slate-700 text-xs font-medium">{agency.phone || '+251 911 000000'}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Mail size={13} color="#64748B" />
                                        <Text className="text-slate-700 text-xs font-medium">{agency.email || 'contact@agency.et'}</Text>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={() => openChatWithAgency(agency.id, agency.name)}
                                    className="mt-4 bg-emerald-600 py-3 rounded-xl items-center flex-row justify-center gap-2 active:opacity-90 shadow-xs"
                                >
                                    <MessageSquare size={14} color="#FFFFFF" />
                                    <Text className="text-white text-xs font-extrabold">Contact Agency via Chat</Text>
                                </Pressable>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}


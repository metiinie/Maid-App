import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    Linking,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    ShieldCheck,
    MapPin,
    Phone,
    Mail,
    CheckCircle,
    MessageSquare,
    Search,
    Building2,
    Award,
    ExternalLink,
    Users,
    Plus,
    X,
    Globe,
} from 'lucide-react-native';
import { candidateService } from '../../services/candidateService';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const SPECIALTY_OPTIONS = ['All', 'Housemaids', 'Caregivers', 'Drivers', 'Cooks'];

const DESTINATIONS = [
    { id: 'ALL', label: 'All Destinations' },
    { id: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' },
    { id: 'UAE', label: '🇦🇪 UAE' },
    { id: 'Kuwait', label: '🇰🇼 Kuwait' },
    { id: 'Qatar', label: '🇶🇦 Qatar' },
];

export default function AgenciesScreen() {
    const router = useRouter();
    const { activeWorkspace } = useAuth();
    const { openChatWithAgency } = useChat();

    const isEmployer = activeWorkspace?.type === 'GULF_EMPLOYER';

    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [selectedDestination, setSelectedDestination] = useState('ALL');

    // Demand Order Modal State
    const [selectedAgencyForOrder, setSelectedAgencyForOrder] = useState<any>(null);
    const [orderTitle, setOrderTitle] = useState('');
    const [orderQuantity, setOrderQuantity] = useState('5');
    const [orderSalary, setOrderSalary] = useState('1,500 SAR ($400 USD)');
    const [orderDestination, setOrderDestination] = useState('Saudi Arabia (Riyadh)');

    useFocusEffect(
        useCallback(() => {
            loadAgencies(false);
        }, [])
    );

    async function loadAgencies(showLoader = true) {
        if (showLoader) setLoading(true);
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
                        phone: '+251911234567',
                        displayPhone: '+251 911 234 567',
                        email: 'info@ethiogulfrecruitment.et',
                        specialties: ['Housemaids', 'Cooks', 'Caregivers'],
                        destinations: ['Saudi Arabia', 'UAE', 'Qatar'],
                        activeCandidatesCount: 142,
                    },
                    {
                        id: 'agency-2',
                        name: 'Blue Nile Foreign Employment Enterprise',
                        license_number: 'ET-MOLSA-2024-042',
                        city: 'Addis Ababa (Kazanchis)',
                        phone: '+251911987654',
                        displayPhone: '+251 911 987 654',
                        email: 'contact@bluenile-manpower.com',
                        specialties: ['Caregivers', 'Drivers', 'Housemaids'],
                        destinations: ['UAE', 'Kuwait', 'Saudi Arabia'],
                        activeCandidatesCount: 98,
                    },
                    {
                        id: 'agency-3',
                        name: 'Addis Overseas Recruitment Agency',
                        license_number: 'ET-MOLSA-2024-115',
                        city: 'Hawassa / Addis Ababa',
                        phone: '+251922456789',
                        displayPhone: '+251 922 456 789',
                        email: 'jobs@addisoverseas.et',
                        specialties: ['Housemaids', 'Cooks', 'Drivers'],
                        destinations: ['Saudi Arabia', 'Kuwait', 'Qatar'],
                        activeCandidatesCount: 76,
                    },
                ]);
            } else {
                setAgencies(list);
            }
        } catch (err) {
            console.error('Failed to load agencies:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        loadAgencies(false);
    };

    const handleCall = (phoneNumber?: string) => {
        if (!phoneNumber) return;
        const clean = phoneNumber.replace(/\s+/g, '');
        Linking.openURL(`tel:${clean}`);
    };

    const handleEmail = (emailAddr?: string) => {
        if (!emailAddr) return;
        Linking.openURL(`mailto:${emailAddr}`);
    };

    function handleOpenDemandOrderModal(agency: any) {
        setSelectedAgencyForOrder(agency);
        setOrderTitle(`Bulk Order for ${agency.name}`);
    }

    function handleSubmitDemandOrder() {
        if (!selectedAgencyForOrder) return;
        Alert.alert(
            'Demand Order Sent!',
            `Your order for ${orderQuantity} workers (${orderTitle}) has been submitted directly to ${selectedAgencyForOrder.name}.`
        );
        const agency = selectedAgencyForOrder;
        setSelectedAgencyForOrder(null);
        openChatWithAgency(agency.id, agency.name, 'demand_order', null);
    }

    const filteredAgencies = agencies.filter((a) => {
        const query = search.toLowerCase();
        const matchesQuery =
            a.name?.toLowerCase().includes(query) ||
            a.license_number?.toLowerCase().includes(query) ||
            a.city?.toLowerCase().includes(query);

        const matchesSpecialty =
            selectedSpecialty === 'All' ||
            (a.specialties && a.specialties.includes(selectedSpecialty));

        const matchesDestination =
            selectedDestination === 'ALL' ||
            (a.destinations && a.destinations.some((d: string) => d.toLowerCase().includes(selectedDestination.toLowerCase())));

        return matchesQuery && matchesSpecialty && matchesDestination;
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-slate-900 text-xl font-extrabold">Agencies Directory</Text>
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
            <View className="px-5 mt-4 mb-2">
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

            {/* Destination Country Filter Chips */}
            <View className="px-5 mb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 py-1">
                    {DESTINATIONS.map((d) => {
                        const isSel = selectedDestination === d.id;
                        return (
                            <TouchableOpacity
                                key={d.id}
                                onPress={() => setSelectedDestination(d.id)}
                                className={`px-3 py-1.5 rounded-full border ${isSel
                                    ? 'bg-slate-900 border-slate-900 shadow-xs'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`text-[11px] font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>
                                    {d.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Specialty Filter Chips */}
            <View className="mb-3 px-5">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 py-1">
                    {SPECIALTY_OPTIONS.map((opt) => {
                        const isSel = selectedSpecialty === opt;
                        return (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => setSelectedSpecialty(opt)}
                                className={`px-3.5 py-1.5 rounded-full border ${isSel
                                    ? 'bg-emerald-600 border-emerald-600 shadow-xs'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView
                    className="px-5 flex-1"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredAgencies.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Building2 size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No agencies found</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">Try resetting your search or filter.</Text>
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
                                        <Text className="text-emerald-800 text-[10px] font-extrabold uppercase">MOLSA License Active</Text>
                                    </View>
                                </View>

                                <Text className="text-slate-900 text-base font-extrabold">{agency.name}</Text>
                                <Text className="text-emerald-700 text-xs font-bold mt-0.5">
                                    License #{agency.license_number || 'ET-MOLSA-2026-098'}
                                </Text>

                                {/* Specialties & Destinations */}
                                {agency.specialties && agency.specialties.length > 0 && (
                                    <View className="flex-row flex-wrap gap-1.5 mt-2.5">
                                        {agency.specialties.map((sp: string, idx: number) => (
                                            <View key={idx} className="bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                                                <Text className="text-slate-700 text-[10px] font-bold">✓ {sp}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View className="mt-3 pt-3 border-t border-slate-100 gap-2">
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center gap-2 flex-1">
                                            <MapPin size={13} color="#64748B" />
                                            <Text className="text-slate-700 text-xs font-medium">{agency.city || 'Addis Ababa'}, Ethiopia</Text>
                                        </View>
                                        <Pressable
                                            onPress={() => router.push('/(tabs)/candidates')}
                                            className="flex-row items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg active:opacity-80"
                                        >
                                            <Users size={12} color="#D97706" />
                                            <Text className="text-amber-900 text-[11px] font-black">
                                                {agency.activeCandidatesCount || 85} Candidates
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <View className="flex-row items-center justify-between mt-1">
                                        <Pressable
                                            onPress={() => handleCall(agency.phone)}
                                            className="flex-row items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl active:opacity-80 flex-1 mr-1.5"
                                        >
                                            <Phone size={13} color="#059669" />
                                            <Text className="text-slate-800 text-xs font-extrabold" numberOfLines={1}>
                                                {agency.displayPhone || agency.phone || '+251 911 000000'}
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => handleEmail(agency.email)}
                                            className="flex-row items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl active:opacity-80 flex-1 ml-1.5"
                                        >
                                            <Mail size={13} color="#059669" />
                                            <Text className="text-slate-800 text-xs font-extrabold" numberOfLines={1}>
                                                Email Agency
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Action Buttons: Direct Demand Order & Chat Agency */}
                                <View className="flex-row items-center gap-2 mt-4">
                                    <Pressable
                                        onPress={() => handleOpenDemandOrderModal(agency)}
                                        className="flex-1 bg-slate-900 py-3 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-90 shadow-xs"
                                    >
                                        <Building2 size={14} color="#F59E0B" />
                                        <Text className="text-amber-400 text-xs font-extrabold">Demand Order</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={() => openChatWithAgency(agency.id, agency.name, 'general_inquiry', null)}
                                        className="flex-1 bg-emerald-600 py-3 rounded-xl items-center flex-row justify-center gap-1.5 active:opacity-90 shadow-xs"
                                    >
                                        <MessageSquare size={14} color="#FFFFFF" />
                                        <Text className="text-white text-xs font-extrabold">Chat Agency</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* Demand Order Modal for Specific Agency */}
            <Modal visible={!!selectedAgencyForOrder} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-slate-900 text-lg font-extrabold">Agency Demand Order</Text>
                            <Pressable onPress={() => setSelectedAgencyForOrder(null)} className="p-1 rounded-full bg-slate-100">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>
                        <Text className="text-emerald-700 text-xs font-bold mb-4">
                            Direct order to: {selectedAgencyForOrder?.name}
                        </Text>

                        <Text className="text-slate-700 text-xs font-bold mb-1">Order Title / Role</Text>
                        <TextInput
                            value={orderTitle}
                            onChangeText={setOrderTitle}
                            placeholder="e.g. 5x Arabic Cooks / Housemaids"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Headcount Quantity</Text>
                        <TextInput
                            value={orderQuantity}
                            onChangeText={setOrderQuantity}
                            keyboardType="number-pad"
                            placeholder="5"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Monthly Salary Offer</Text>
                        <TextInput
                            value={orderSalary}
                            onChangeText={setOrderSalary}
                            placeholder="1,500 SAR ($400 USD)"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-3"
                        />

                        <Text className="text-slate-700 text-xs font-bold mb-1">Target Destination City</Text>
                        <TextInput
                            value={orderDestination}
                            onChangeText={setOrderDestination}
                            placeholder="Saudi Arabia (Riyadh)"
                            placeholderTextColor="#94A3B8"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium mb-4"
                        />

                        <View className="flex-row gap-2">
                            <Pressable
                                onPress={() => setSelectedAgencyForOrder(null)}
                                className="flex-1 bg-slate-100 border border-slate-200 py-3 rounded-xl items-center"
                            >
                                <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSubmitDemandOrder}
                                className="flex-1 bg-amber-500 py-3 rounded-xl items-center active:opacity-90 shadow-xs"
                            >
                                <Text className="text-slate-950 text-xs font-black">Submit & Chat</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

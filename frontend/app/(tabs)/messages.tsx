import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Pressable,
    RefreshControl,
    Modal,
    Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
    ChevronRight,
    Search,
    ShieldCheck,
    MessageSquarePlus,
    RefreshCw,
    CheckCheck,
    X,
    Building2,
    MessageSquare,
} from 'lucide-react-native';
import { chatService } from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

export default function MessagesScreen() {
    const { activeWorkspace } = useAuth();
    const isEmployer = activeWorkspace?.type === 'GULF_EMPLOYER';

    const [threads, setThreads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);

    const { openChatWithAgency } = useChat();

    const sampleAgencies = [
        {
            id: 'agency-1',
            name: 'Ethio-Gulf Overseas Manpower Agency',
            molsaLicense: 'MOLSA/LIC/2024/849',
            logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
            activeCandidatesCount: 142,
        },
        {
            id: 'agency-2',
            name: 'Blue Nile Foreign Employment Enterprise',
            molsaLicense: 'MOLSA/LIC/2024/732',
            logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200',
            activeCandidatesCount: 98,
        },
        {
            id: 'agency-3',
            name: 'Addis Overseas Recruitment Agency',
            molsaLicense: 'MOLSA/LIC/2024/910',
            logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200',
            activeCandidatesCount: 115,
        },
    ];

    useFocusEffect(
        useCallback(() => {
            loadConversations(false);
        }, [])
    );

    async function loadConversations(showLoader = true) {
        if (showLoader) setLoading(true);
        try {
            const res: any = await chatService.getUserConversations();
            const list = res.data || [];
            if (list.length === 0) {
                setThreads([
                    {
                        id: 'thread-1',
                        agencyId: 'agency-1',
                        agencyName: 'Ethio-Gulf Overseas Manpower Agency',
                        logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
                        lastMessage: 'Your GAMCA E-health medical clearance for Saudi Arabia has been approved!',
                        time: '10:45 AM',
                        unreadCount: 2,
                        verified: true,
                        tag: 'Demand Order #101 Inquiry',
                    },
                    {
                        id: 'thread-2',
                        agencyId: 'agency-2',
                        agencyName: 'Blue Nile Foreign Employment Enterprise',
                        logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200',
                        lastMessage: 'Hello, we received your inquiry regarding candidate selection ET-8492.',
                        time: 'Yesterday',
                        unreadCount: 0,
                        verified: true,
                        tag: 'Candidate Selection ET-8492',
                    },
                    {
                        id: 'thread-3',
                        agencyId: 'agency-3',
                        agencyName: 'Addis Overseas Recruitment Agency',
                        logoUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200',
                        lastMessage: 'Your contract documents have been forwarded to the Saudi MOL office.',
                        time: '3 days ago',
                        unreadCount: 0,
                        verified: true,
                        tag: 'Visa & MOL Clearance',
                    },
                ]);
            } else {
                setThreads(list);
            }
        } catch (err) {
            console.error('Failed to load user conversations:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        loadConversations(false);
    };

    const handleStartChatWithAgency = (ag: any) => {
        setShowNewChatModal(false);
        openChatWithAgency(ag.id, ag.name, 'general_inquiry');
    };

    const filteredThreads = threads.filter((t) => {
        const q = search.toLowerCase();
        const agencyName = t.agencyName || t.agency?.name || '';
        const msg = t.lastMessage || t.messages?.[0]?.text || '';
        const tag = t.tag || '';
        return agencyName.toLowerCase().includes(q) || msg.toLowerCase().includes(q) || tag.toLowerCase().includes(q);
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-1 mr-2">
                        <Text className="text-xl font-extrabold text-slate-900">
                            {isEmployer ? 'Employer Agency Chat' : 'Agency Messages'}
                        </Text>
                        <Text className="text-slate-500 text-xs mt-0.5 font-medium">
                            Direct B2B communication line with licensed MOLSA agencies
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => setShowNewChatModal(true)}
                        className="bg-amber-500 px-3.5 py-2 rounded-xl flex-row items-center gap-1 active:opacity-90 shadow-xs"
                    >
                        <MessageSquarePlus size={15} color="#0F172A" />
                        <Text className="text-slate-950 text-xs font-black">New Chat</Text>
                    </Pressable>
                </View>
            </View>

            {/* Search Bar */}
            <View className="px-5 my-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 shadow-xs">
                    <Search size={16} color="#64748B" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search agency thread, inquiry tag..."
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
                    {filteredThreads.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <MessageSquarePlus size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No conversations found</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">
                                Tap "New Chat" above to contact verified recruitment agencies.
                            </Text>
                        </View>
                    ) : (
                        filteredThreads.map((thread) => {
                            const agencyId = thread.agencyId || thread.agency?.id || 'agency-1';
                            const agencyName = thread.agencyName || thread.agency?.name || 'Licensed Agency';
                            const lastMsg = thread.lastMessage || thread.messages?.[0]?.text || 'Tap to chat with agency';
                            const unread = thread.unreadCount || 0;

                            return (
                                <TouchableOpacity
                                    key={thread.id}
                                    onPress={() => openChatWithAgency(agencyId, agencyName)}
                                    className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs active:opacity-90"
                                >
                                    {/* Inquiry Tag Badge */}
                                    {thread.tag && (
                                        <View className="flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                            <View className="bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                                <Text className="text-slate-700 text-[10px] font-extrabold">{thread.tag}</Text>
                                            </View>
                                            <Text className="text-[10px] text-slate-400 font-semibold">{thread.time || 'Today'}</Text>
                                        </View>
                                    )}

                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1 mr-3">
                                            <View className="relative">
                                                <Image
                                                    source={{ uri: thread.logoUrl || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200' }}
                                                    className="w-12 h-12 rounded-2xl mr-3 border border-slate-200"
                                                />
                                                <View className="absolute bottom-0 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center gap-1">
                                                    <Text className="text-sm font-extrabold text-slate-900" numberOfLines={1}>
                                                        {agencyName}
                                                    </Text>
                                                    <ShieldCheck size={14} color="#059669" />
                                                </View>
                                                <Text className="text-xs text-slate-600 font-medium mt-1" numberOfLines={1}>
                                                    {lastMsg}
                                                </Text>
                                            </View>
                                        </View>

                                        {unread > 0 ? (
                                            <View className="bg-emerald-600 px-2 py-0.5 rounded-full items-center justify-center">
                                                <Text className="text-white text-[10px] font-extrabold">{unread}</Text>
                                            </View>
                                        ) : (
                                            <ChevronRight size={18} color="#94A3B8" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}

            {/* Start New Agency Chat Modal */}
            <Modal visible={showNewChatModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/60 justify-center items-center p-5">
                    <View className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm shadow-xl">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-slate-900 text-lg font-extrabold">Start Agency Chat</Text>
                            <Pressable onPress={() => setShowNewChatModal(false)} className="p-1 rounded-full bg-slate-100">
                                <X size={18} color="#64748B" />
                            </Pressable>
                        </View>
                        <Text className="text-slate-500 text-xs mb-4 font-medium">
                            Select a MOLSA-licensed Ethiopian agency to initiate direct B2B recruitment chat:
                        </Text>

                        {sampleAgencies.map((ag) => (
                            <Pressable
                                key={ag.id}
                                onPress={() => handleStartChatWithAgency(ag)}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-3 flex-row items-center justify-between active:opacity-80"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <Image source={{ uri: ag.logoUrl }} className="w-10 h-10 rounded-xl mr-3 border border-slate-200" />
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-1">
                                            <Text className="text-slate-900 text-xs font-bold" numberOfLines={1}>{ag.name}</Text>
                                            <ShieldCheck size={12} color="#059669" />
                                        </View>
                                        <Text className="text-slate-500 text-[10px] font-medium">{ag.molsaLicense}</Text>
                                    </View>
                                </View>
                                <MessageSquare size={16} color="#059669" />
                            </Pressable>
                        ))}

                        <Pressable
                            onPress={() => setShowNewChatModal(false)}
                            className="bg-slate-100 border border-slate-200 py-3 rounded-xl items-center mt-2"
                        >
                            <Text className="text-slate-700 text-xs font-bold">Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

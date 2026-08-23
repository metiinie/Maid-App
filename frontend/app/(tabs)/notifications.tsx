import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Pressable,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import {
    CheckCircle2,
    FileText,
    Send,
    Bell,
    CheckCheck,
    AlertCircle,
    Building2,
    ShieldCheck,
    ChevronRight,
    MessageSquare,
    Plane,
    Briefcase,
} from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { chatService } from '../../services/chatService';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsScreen() {
    const router = useRouter();
    const { activeWorkspace } = useAuth();
    const isEmployer = activeWorkspace?.type === 'GULF_EMPLOYER';

    const { openChatWithAgency } = useChat();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const filterOptions = isEmployer
        ? [
            { id: 'ALL', label: 'All Alerts' },
            { id: 'UNREAD', label: 'Unread' },
            { id: 'demand_order', label: 'Demand Orders' },
            { id: 'medical', label: 'Medical & GAMCA' },
            { id: 'visa', label: 'Visa & Flight' },
            { id: 'inquiry', label: 'Agency Chat' },
        ]
        : [
            { id: 'ALL', label: 'All Alerts' },
            { id: 'UNREAD', label: 'Unread' },
            { id: 'medical', label: 'Medical' },
            { id: 'application', label: 'Applications' },
            { id: 'inquiry', label: 'Inquiries' },
        ];

    useFocusEffect(
        useCallback(() => {
            loadNotifications(false);
        }, [])
    );

    async function loadNotifications(showLoader = true) {
        if (showLoader) setLoading(true);
        try {
            const res: any = await chatService.getNotifications();
            const list = res.data || [];
            if (list.length === 0) {
                setNotifications([
                    {
                        id: 'notif-101',
                        title: 'Demand Order Candidate Allocated',
                        body: 'Ethio-Gulf Manpower allocated 3 verified candidates for Demand Order #ET-DO-8402 (Housemaid & Cook).',
                        time: '1 hour ago',
                        type: 'demand_order',
                        isRead: false,
                        agency_id: 'agency-1',
                        agency_name: 'Ethio-Gulf Overseas Recruitment',
                    },
                    {
                        id: 'notif-102',
                        title: 'GAMCA Medical Clearance Approved',
                        body: 'Candidate ET-8492 (Alem Tadesse) has passed GAMCA E-health medical inspection for Saudi Arabia.',
                        time: '3 hours ago',
                        type: 'medical',
                        isRead: false,
                        candidate_id: 'cand-101',
                        agency_id: 'agency-1',
                        agency_name: 'Ethio-Gulf Overseas Recruitment',
                    },
                    {
                        id: 'notif-103',
                        title: 'Work Visa & Flight Confirmed',
                        body: 'Work Visa #SA-849102 issued for Riyadh deployment. Flight scheduled via Ethiopian Airlines.',
                        time: 'Yesterday',
                        type: 'visa',
                        isRead: true,
                        agency_id: 'agency-2',
                        agency_name: 'Blue Nile Foreign Employment',
                    },
                    {
                        id: 'notif-104',
                        title: 'Agency Inquiry Response Received',
                        body: 'Addis Overseas Recruitment responded to your direct demand order inquiry for 5 Caregivers.',
                        time: '2 days ago',
                        type: 'inquiry',
                        isRead: true,
                        agency_id: 'agency-3',
                        agency_name: 'Addis Overseas Recruitment',
                    },
                ]);
            } else {
                setNotifications(list);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications(false);
    };

    async function handleMarkAllRead() {
        try {
            await chatService.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
    }

    async function handleNotificationClick(n: any) {
        if (!n.isRead) {
            try {
                await chatService.markNotificationRead(n.id);
            } catch { }
            setNotifications((prev) =>
                prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
            );
        }

        // Smart Action Routing
        if (n.type === 'demand_order') {
            router.push('/(tabs)/vacancies' as any);
        } else if (n.type === 'inquiry' && n.agency_id) {
            openChatWithAgency(n.agency_id, n.agency_name || 'Agency Support');
        } else if (n.type === 'medical' || n.type === 'visa') {
            if (n.candidate_id) {
                router.push(`/candidate/${n.candidate_id}` as any);
            } else {
                router.push('/(tabs)/saved' as any);
            }
        } else {
            router.push('/(tabs)/saved' as any);
        }
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const filteredNotifications = notifications.filter((n) => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'UNREAD') return !n.isRead;
        return n.type === activeFilter;
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <View className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 items-center justify-center">
                            <Bell size={20} color="#D97706" />
                        </View>
                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xl font-extrabold text-slate-900">
                                    {isEmployer ? 'Employer Recruitment Alerts' : 'Alerts & Status'}
                                </Text>
                                {unreadCount > 0 && (
                                    <View className="bg-amber-500 px-2 py-0.5 rounded-full">
                                        <Text className="text-white text-[10px] font-black">{unreadCount} New</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-slate-500 text-xs mt-0.5 font-medium">
                                Real-time demand order, GAMCA medical & visa alerts
                            </Text>
                        </View>
                    </View>

                    {unreadCount > 0 && (
                        <Pressable
                            onPress={handleMarkAllRead}
                            className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:opacity-80"
                        >
                            <CheckCheck size={14} color="#059669" />
                            <Text className="text-emerald-800 text-xs font-bold">Mark Read</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Filter Chips Bar */}
            <View className="px-5 mt-4 mb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 py-1">
                    {filterOptions.map((f) => {
                        const isSel = activeFilter === f.id;
                        return (
                            <TouchableOpacity
                                key={f.id}
                                onPress={() => setActiveFilter(f.id)}
                                className={`px-3.5 py-1.5 rounded-full border ${isSel
                                    ? 'bg-slate-900 border-slate-900 shadow-xs'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${isSel ? 'text-amber-400 font-black' : 'text-slate-700'}`}>
                                    {f.label}
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
                    className="flex-1 px-5 pt-2"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredNotifications.length === 0 ? (
                        <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-4 shadow-xs">
                            <Bell size={32} color="#94A3B8" />
                            <Text className="text-slate-900 text-sm font-bold mt-3">No alerts found</Text>
                            <Text className="text-slate-500 text-xs text-center mt-1">
                                You're all caught up! Check back later for recruitment updates.
                            </Text>
                        </View>
                    ) : (
                        filteredNotifications.map((n) => (
                            <Pressable
                                key={n.id}
                                onPress={() => handleNotificationClick(n)}
                                className={`p-4 rounded-2xl mb-3 border ${n.isRead ? 'bg-white border-slate-200' : 'bg-amber-50/60 border-amber-200'
                                    } flex-row items-start shadow-xs active:opacity-90`}
                            >
                                <View
                                    className={`p-2.5 rounded-xl mr-3 mt-0.5 border ${n.type === 'demand_order'
                                        ? 'bg-amber-100 border-amber-200'
                                        : n.type === 'medical'
                                            ? 'bg-emerald-100 border-emerald-200'
                                            : n.type === 'visa'
                                                ? 'bg-blue-100 border-blue-200'
                                                : 'bg-indigo-100 border-indigo-200'
                                        }`}
                                >
                                    {n.type === 'demand_order' ? (
                                        <Briefcase size={18} color="#D97706" />
                                    ) : n.type === 'medical' ? (
                                        <CheckCircle2 size={18} color="#059669" />
                                    ) : n.type === 'visa' ? (
                                        <Plane size={18} color="#1D4ED8" />
                                    ) : (
                                        <MessageSquare size={18} color="#4338CA" />
                                    )}
                                </View>

                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-sm font-extrabold text-slate-900 flex-1 mr-2" numberOfLines={1}>
                                            {n.title}
                                        </Text>
                                        <Text className="text-[10px] text-slate-400 font-bold">{n.time || n.created_at}</Text>
                                    </View>
                                    <Text className="text-xs text-slate-700 leading-relaxed font-medium">
                                        {n.body || n.message}
                                    </Text>

                                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                        <Text className="text-[10px] font-bold text-slate-400">
                                            {n.agency_name || 'System Alert'}
                                        </Text>
                                        <View className="flex-row items-center gap-0.5">
                                            <Text className="text-[10px] font-extrabold text-amber-600">View Action</Text>
                                            <ChevronRight size={12} color="#D97706" />
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        ))
                    )}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}

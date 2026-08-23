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
} from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { chatService } from '../../services/chatService';
import { useChat } from '../../context/ChatContext';

const FILTER_OPTIONS = [
    { id: 'ALL', label: 'All Alerts' },
    { id: 'UNREAD', label: 'Unread' },
    { id: 'medical', label: 'Medical' },
    { id: 'application', label: 'Applications' },
    { id: 'inquiry', label: 'Inquiries' },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const { openChatWithAgency } = useChat();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

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
                        id: 'notif-1',
                        title: 'Medical Clearance Approved',
                        body: 'Your GAMCA E-health medical clearance for Saudi Arabia has been marked as CLEARED by agency admin.',
                        time: '2 hours ago',
                        type: 'medical',
                        isRead: false,
                        agency_id: 'agency-1',
                        agency_name: 'Ethio-Gulf Overseas Recruitment',
                    },
                    {
                        id: 'notif-2',
                        title: 'Application Shortlisted',
                        body: 'Your application for Housemaid & Cook (Ref #104) has been shortlisted by Ethio-Gulf Overseas Recruitment.',
                        time: 'Yesterday',
                        type: 'application',
                        isRead: false,
                        vacancy_id: 'vac-101',
                        agency_id: 'agency-1',
                        agency_name: 'Ethio-Gulf Overseas Recruitment',
                    },
                    {
                        id: 'notif-3',
                        title: 'Inquiry Response Received',
                        body: 'Blue Nile Foreign Employment responded to your candidate inquiry regarding domestic worker placement.',
                        time: '2 days ago',
                        type: 'inquiry',
                        isRead: true,
                        agency_id: 'agency-2',
                        agency_name: 'Blue Nile Foreign Employment',
                    },
                    {
                        id: 'notif-4',
                        title: 'Flight Ticket Scheduled',
                        body: 'Your flight ticket to Dubai (Riyadh transit) has been confirmed by Addis Overseas Agency.',
                        time: '3 days ago',
                        type: 'application',
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
        // Mark read
        if (!n.isRead) {
            try {
                await chatService.markNotificationRead(n.id);
            } catch { }
            setNotifications((prev) =>
                prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
            );
        }

        // Action routing
        if (n.type === 'inquiry' && n.agency_id) {
            openChatWithAgency(n.agency_id, n.agency_name || 'Agency Support');
        } else if (n.type === 'application') {
            router.push('/(tabs)/vacancies' as any);
        } else if (n.type === 'medical') {
            router.push('/(tabs)/profile' as any);
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
                        <View className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center">
                            <Bell size={20} color="#059669" />
                        </View>
                        <View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xl font-extrabold text-slate-900">Alerts & Status</Text>
                                {unreadCount > 0 && (
                                    <View className="bg-amber-500 px-2 py-0.5 rounded-full">
                                        <Text className="text-white text-[10px] font-black">{unreadCount} New</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-slate-500 text-xs mt-0.5 font-medium">
                                Real-time application, medical & visa alerts
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
                    {FILTER_OPTIONS.map((f) => {
                        const isSel = activeFilter === f.id;
                        return (
                            <TouchableOpacity
                                key={f.id}
                                onPress={() => setActiveFilter(f.id)}
                                className={`px-3.5 py-1.5 rounded-full border ${isSel
                                    ? 'bg-emerald-600 border-emerald-600 shadow-xs'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${isSel ? 'text-white' : 'text-slate-700'}`}>
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
                                You're all caught up! Check back later for updates.
                            </Text>
                        </View>
                    ) : (
                        filteredNotifications.map((n) => (
                            <Pressable
                                key={n.id}
                                onPress={() => handleNotificationClick(n)}
                                className={`p-4 rounded-2xl mb-3 border ${n.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/80 border-emerald-200'
                                    } flex-row items-start shadow-xs active:opacity-90`}
                            >
                                <View
                                    className={`p-2.5 rounded-xl mr-3 mt-0.5 border ${n.type === 'medical'
                                        ? 'bg-emerald-100 border-emerald-200'
                                        : n.type === 'application'
                                            ? 'bg-blue-100 border-blue-200'
                                            : 'bg-indigo-100 border-indigo-200'
                                        }`}
                                >
                                    {n.type === 'medical' ? (
                                        <CheckCircle2 size={18} color="#059669" />
                                    ) : n.type === 'application' ? (
                                        <FileText size={18} color="#1E3A8A" />
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
                                            <Text className="text-[10px] font-bold text-emerald-700">View Action</Text>
                                            <ChevronRight size={12} color="#059669" />
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



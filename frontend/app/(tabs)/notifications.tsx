import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { CheckCircle2, FileText, Send, Bell, CheckCheck } from 'lucide-react-native';
import { chatService } from '../../services/chatService';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        setLoading(true);
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
                    },
                    {
                        id: 'notif-2',
                        title: 'Application Shortlisted',
                        body: 'Your application for Housemaid & Cook (Ref #104) has been shortlisted by Ethio-Gulf Overseas Recruitment.',
                        time: 'Yesterday',
                        type: 'application',
                        isRead: true,
                    },
                    {
                        id: 'notif-3',
                        title: 'Inquiry Response Received',
                        body: 'The agency responded to your candidate inquiry regarding your domestic worker placement.',
                        time: '2 days ago',
                        type: 'inquiry',
                        isRead: true,
                    },
                ]);
            } else {
                setNotifications(list);
            }
        } catch (err) {
            console.error('Failed to load notifications:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleMarkAllRead() {
        try {
            await chatService.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch { }
    }

    async function handleMarkRead(id: string) {
        try {
            await chatService.markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch { }
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-xl font-extrabold text-slate-900">Notifications</Text>
                        <Text className="text-slate-500 text-xs mt-0.5 font-medium">Updates on your applications & medical status</Text>
                    </View>
                    <Pressable
                        onPress={handleMarkAllRead}
                        className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex-row items-center gap-1 active:opacity-80"
                    >
                        <CheckCheck size={14} color="#059669" />
                        <Text className="text-slate-700 text-xs font-bold">Mark All Read</Text>
                    </Pressable>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#059669" size="large" className="mt-10" />
            ) : (
                <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                    {notifications.map((n) => (
                        <Pressable
                            key={n.id}
                            onPress={() => handleMarkRead(n.id)}
                            className={`p-4 rounded-2xl mb-3 border ${n.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50 border border-emerald-200'
                                } flex-row items-start shadow-xs active:opacity-90`}
                        >
                            <View className="p-2.5 rounded-xl bg-emerald-100 mr-3 mt-0.5 border border-emerald-200">
                                {n.type === 'medical' ? (
                                    <CheckCircle2 size={18} color="#059669" />
                                ) : n.type === 'application' ? (
                                    <FileText size={18} color="#1E3A8A" />
                                ) : (
                                    <Send size={18} color="#2563EB" />
                                )}
                            </View>

                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-sm font-bold text-slate-900 flex-1 mr-2">{n.title}</Text>
                                    <Text className="text-xs text-slate-500 font-medium">{n.time || n.created_at}</Text>
                                </View>
                                <Text className="text-xs text-slate-700 leading-relaxed font-medium">{n.body || n.message}</Text>
                            </View>
                        </Pressable>
                    ))}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}


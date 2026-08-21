import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CheckCircle2, FileText, Send } from 'lucide-react-native';

export default function NotificationsScreen() {
    const notifications = [
        {
            id: '1',
            title: 'Medical Clearance Approved',
            body: 'Your GAMCA E-health medical clearance for Saudi Arabia has been marked as CLEARED by agency admin.',
            time: '2 hours ago',
            type: 'medical',
            isRead: false,
        },
        {
            id: '2',
            title: 'Application Shortlisted',
            body: 'Your application for Housemaid & Cook (Ref #104) has been shortlisted by Ethio-Gulf Overseas Recruitment.',
            time: 'Yesterday',
            type: 'application',
            isRead: true,
        },
        {
            id: '3',
            title: 'Inquiry Response Received',
            body: 'The agency responded to your candidate inquiry regarding Alem Tadesse.',
            time: '2 days ago',
            type: 'inquiry',
            isRead: true,
        },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <Text className="text-xl font-extrabold text-slate-900">Notifications</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                {notifications.map((n) => (
                    <View
                        key={n.id}
                        className={`p-4 rounded-2xl mb-3 border ${n.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50 border border-emerald-200'
                            } flex-row items-start shadow-xs`}
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
                                <Text className="text-xs text-slate-500 font-medium">{n.time}</Text>
                            </View>
                            <Text className="text-xs text-slate-700 leading-relaxed font-medium">{n.body}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

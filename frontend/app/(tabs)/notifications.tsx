import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react-native';

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
            <View className="px-4 pt-12 pb-4 bg-white border-b border-slate-200">
                <Text className="text-xl font-bold text-slate-900">Notifications</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {notifications.map((n) => (
                    <View
                        key={n.id}
                        className={`p-4 rounded-xl mb-3 border ${n.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/60 border-emerald-200'
                            } flex-row items-start`}
                    >
                        <View className="p-2.5 rounded-full bg-emerald-100 mr-3 mt-0.5">
                            {n.type === 'medical' ? (
                                <CheckCircle2 size={18} color="#10B981" />
                            ) : n.type === 'application' ? (
                                <FileText size={18} color="#3B82F6" />
                            ) : (
                                <Send size={18} color="#8B5CF6" />
                            )}
                        </View>

                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-1">
                                <Text className="text-sm font-bold text-slate-900 flex-1 mr-2">{n.title}</Text>
                                <Text className="text-xs text-slate-400 font-medium">{n.time}</Text>
                            </View>
                            <Text className="text-xs text-slate-600 leading-relaxed">{n.body}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

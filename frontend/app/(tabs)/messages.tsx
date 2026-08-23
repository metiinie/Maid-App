import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronRight, MessageSquare } from 'lucide-react-native';
import { useChat } from '../../context/ChatContext';

export default function MessagesScreen() {
    const { openChatWithAgency } = useChat();

    const threads = [
        {
            id: 'agency-1',
            agencyName: 'Ethio-Gulf Overseas Recruitment Agency',
            logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
            lastMessage: 'Your GAMCA medical clearance report has been approved!',
            time: '10:45 AM',
            unreadCount: 2,
        },
        {
            id: 'agency-2',
            agencyName: 'Blue Nile Foreign Employment',
            logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200',
            lastMessage: 'Hello, we received your inquiry regarding your domestic worker application.',
            time: 'Yesterday',
            unreadCount: 0,
        },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <Text className="text-xl font-extrabold text-slate-900">Agency Messages</Text>
                <Text className="text-slate-500 text-xs mt-0.5 font-medium">Direct communication with licensed agencies</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                {threads.map((thread) => (
                    <TouchableOpacity
                        key={thread.id}
                        onPress={() => openChatWithAgency(thread.id, thread.agencyName)}
                        className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 flex-row items-center justify-between shadow-xs active:opacity-90"
                    >
                        <View className="flex-row items-center flex-1 mr-3">
                            <Image source={{ uri: thread.logoUrl }} className="w-12 h-12 rounded-full mr-3 border border-slate-200" />
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-sm font-bold text-slate-900 flex-1 mr-2" numberOfLines={1}>
                                        {thread.agencyName}
                                    </Text>
                                    <Text className="text-xs text-slate-500 font-medium">{thread.time}</Text>
                                </View>
                                <Text className="text-xs text-slate-600 font-medium mt-1" numberOfLines={1}>
                                    {thread.lastMessage}
                                </Text>
                            </View>
                        </View>

                        {thread.unreadCount > 0 ? (
                            <View className="bg-emerald-600 w-6 h-6 rounded-full items-center justify-center">
                                <Text className="text-white text-xs font-bold">{thread.unreadCount}</Text>
                            </View>
                        ) : (
                            <ChevronRight size={18} color="#94A3B8" />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}


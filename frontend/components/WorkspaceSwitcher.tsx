import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, Workspace } from '../context/AuthContext';

export function WorkspaceSwitcher() {
    const { workspaces, activeWorkspace, switchWorkspace } = useAuth();
    const [visible, setVisible] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case 'PERSONAL':
                return 'person-circle-outline';
            case 'AGENCY':
                return 'briefcase-outline';
            case 'GULF_EMPLOYER':
                return 'business-outline';
            case 'PLATFORM_ADMIN':
                return 'shield-checkmark-outline';
            default:
                return 'apps-outline';
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'PERSONAL':
                return 'bg-blue-100 text-blue-800';
            case 'AGENCY':
                return 'bg-emerald-100 text-emerald-800';
            case 'GULF_EMPLOYER':
                return 'bg-amber-100 text-amber-800';
            case 'PLATFORM_ADMIN':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                activeOpacity={0.8}
                className="flex-row items-center bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
            >
                <Ionicons
                    name={getIcon(activeWorkspace?.type || 'PERSONAL') as any}
                    size={18}
                    color="#059669"
                    style={{ marginRight: 6 }}
                />
                <Text className="text-xs font-semibold text-gray-800 max-w-[140px]" numberOfLines={1}>
                    {activeWorkspace?.name || 'Switch Workspace'}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#6B7280" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                    className="flex-1 bg-black/50 justify-center items-center px-4"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl border border-gray-100"
                    >
                        <View className="flex-row justify-between items-center pb-3 border-b border-gray-100 mb-3">
                            <View>
                                <Text className="text-base font-bold text-gray-900">Switch Workspace</Text>
                                <Text className="text-xs text-gray-500 mt-0.5">Select active organization context</Text>
                            </View>
                            <TouchableOpacity onPress={() => setVisible(false)} className="p-1">
                                <Ionicons name="close" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-72">
                            {workspaces.map((ws: Workspace) => {
                                const isSelected = activeWorkspace?.id === ws.id;
                                return (
                                    <TouchableOpacity
                                        key={ws.id}
                                        onPress={() => {
                                            switchWorkspace(ws.id);
                                            setVisible(false);
                                        }}
                                        className={`flex-row items-center justify-between p-3.5 rounded-xl mb-2 border ${isSelected ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 bg-gray-50/60'
                                            }`}
                                    >
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <View className="w-9 h-9 rounded-full bg-emerald-100 items-center justify-center mr-3">
                                                <Ionicons name={getIcon(ws.type) as any} size={18} color="#059669" />
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center">
                                                    <Text className="text-sm font-semibold text-gray-900 mr-1.5" numberOfLines={1}>
                                                        {ws.name}
                                                    </Text>
                                                    {ws.isVerified && (
                                                        <Ionicons name="checkmark-circle" size={14} color="#059669" />
                                                    )}
                                                </View>
                                                <Text className="text-xs text-gray-500 capitalize">{ws.role.toLowerCase().replace('_', ' ')}</Text>
                                            </View>
                                        </View>

                                        {isSelected && <Ionicons name="checkmark" size={18} color="#059669" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

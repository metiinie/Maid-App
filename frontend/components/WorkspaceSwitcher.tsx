import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { User, Briefcase, Building, ShieldCheck, Grid, ChevronDown, X, CheckCircle2, Check } from 'lucide-react-native';
import { useAuth, Workspace } from '../context/AuthContext';

export function WorkspaceSwitcher() {
    const { workspaces, activeWorkspace, switchWorkspace, admin } = useAuth();
    const [visible, setVisible] = useState(false);

    const visibleWorkspaces = workspaces.filter(
        (ws: Workspace) => admin || (ws.type !== 'AGENCY' && ws.type !== 'PLATFORM_ADMIN')
    );

    const renderIcon = (type: string, color = '#059669', size = 18) => {
        switch (type) {
            case 'PERSONAL':
                return <User size={size} color={color} />;
            case 'AGENCY':
                return <Briefcase size={size} color={color} />;
            case 'GULF_EMPLOYER':
                return <Building size={size} color={color} />;
            case 'PLATFORM_ADMIN':
                return <ShieldCheck size={size} color={color} />;
            default:
                return <Grid size={size} color={color} />;
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                activeOpacity={0.8}
                className="flex-row items-center bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm"
            >
                <View style={{ marginRight: 6 }}>
                    {renderIcon(activeWorkspace?.type || 'PERSONAL', '#059669', 18)}
                </View>
                <Text className="text-xs font-semibold text-gray-800 max-w-[140px]" numberOfLines={1}>
                    {activeWorkspace?.name || 'Switch Workspace'}
                </Text>
                <View style={{ marginLeft: 4 }}>
                    <ChevronDown size={14} color="#6B7280" />
                </View>
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
                                <X size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-72">
                            {visibleWorkspaces.map((ws: Workspace) => {
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
                                                {renderIcon(ws.type, '#059669', 18)}
                                            </View>
                                            <View className="flex-1">
                                                <View className="flex-row items-center">
                                                    <Text className="text-sm font-semibold text-gray-900 mr-1.5" numberOfLines={1}>
                                                        {ws.name}
                                                    </Text>
                                                    {ws.isVerified && (
                                                        <CheckCircle2 size={14} color="#059669" />
                                                    )}
                                                </View>
                                                <Text className="text-xs text-gray-500 capitalize">
                                                    {(ws.role || '').toLowerCase().replace('_', ' ')}
                                                </Text>
                                            </View>
                                        </View>

                                        {isSelected && <Check size={18} color="#059669" />}
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

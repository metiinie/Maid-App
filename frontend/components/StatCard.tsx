import React from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    color?: string;
    bgColor?: string;
}

export function StatCard({
    label,
    value,
    icon: IconComponent,
    trend,
    color = '#059669',
    bgColor = 'bg-emerald-50',
}: StatCardProps) {
    return (
        <View className="flex-1 min-w-[45%] bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
                <View className={`w-9 h-9 rounded-xl ${bgColor} items-center justify-center`}>
                    <IconComponent size={18} color={color} />
                </View>
                {trend && (
                    <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-extrabold text-emerald-800">{trend}</Text>
                    </View>
                )}
            </View>
            <Text className="text-slate-900 text-2xl font-black">{value}</Text>
            <Text className="text-slate-500 text-[11px] font-bold mt-0.5">{label}</Text>
        </View>
    );
}

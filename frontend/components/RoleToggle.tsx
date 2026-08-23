import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Building2, Briefcase } from 'lucide-react-native';

interface RoleToggleProps {
    mode: 'employer' | 'seeker';
    onSelectMode: (mode: 'employer' | 'seeker') => void;
}

export function RoleToggle({ mode, onSelectMode }: RoleToggleProps) {
    return (
        <View className="bg-slate-100 p-1.5 rounded-full flex-row gap-1 border border-slate-200 shadow-xs my-2">
            <Pressable
                onPress={() => onSelectMode('employer')}
                className={`flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-full transition-all ${mode === 'employer' ? 'bg-slate-900 shadow-xs' : 'bg-transparent'
                    }`}
            >
                <Building2 size={16} color={mode === 'employer' ? '#F59E0B' : '#64748B'} />
                <Text
                    className={`ml-2 text-xs font-bold ${mode === 'employer' ? 'text-white font-extrabold' : 'text-slate-600'
                        }`}
                >
                    Employer
                </Text>
            </Pressable>

            <Pressable
                onPress={() => onSelectMode('seeker')}
                className={`flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-full transition-all ${mode === 'seeker' ? 'bg-amber-500 shadow-xs' : 'bg-transparent'
                    }`}
            >
                <Briefcase size={16} color={mode === 'seeker' ? '#0F172A' : '#64748B'} />
                <Text
                    className={`ml-2 text-xs font-bold ${mode === 'seeker' ? 'text-slate-950 font-extrabold' : 'text-slate-600'
                        }`}
                >
                    Job Seeker
                </Text>
            </Pressable>
        </View>
    );
}

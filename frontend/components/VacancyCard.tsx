import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

export interface VacancyProps {
    id: string;
    title: string;
    country: string;
    country_flag?: string;
    salary_range: string;
    contract_duration: string;
    employer_type: string;
    positions_available: number;
    deadline?: string;
    benefits?: string[];
}

interface VacancyCardProps {
    vacancy: VacancyProps;
    onPress: () => void;
}

export function VacancyCard({ vacancy, onPress }: VacancyCardProps) {
    const countryFlags: Record<string, string> = {
        'Saudi Arabia': '🇸🇦',
        UAE: '🇦🇪',
        Qatar: '🇶🇦',
        Kuwait: '🇰🇼',
        Bahrain: '🇧🇭',
    };

    const flag = vacancy.country_flag || countryFlags[vacancy.country] || '🇸🇦';

    return (
        <Pressable
            onPress={onPress}
            className="bg-white border border-slate-200 rounded-3xl p-5 mb-3 shadow-xs active:opacity-95"
        >
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">{flag}</Text>
                    <View>
                        <Text className="text-slate-900 text-base font-black">{vacancy.title}</Text>
                        <Text className="text-slate-500 text-xs font-semibold">
                            {vacancy.country} • {vacancy.employer_type || 'Family Household'}
                        </Text>
                    </View>
                </View>

                <View className="bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <Text className="text-emerald-900 text-[10px] font-black uppercase">Visa Incl.</Text>
                </View>
            </View>

            <Text className="text-slate-900 text-sm font-black mt-1">
                {vacancy.salary_range}
            </Text>

            {/* Benefits & Contract chips */}
            <View className="flex-row items-center flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                <View className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    <Text className="text-slate-700 text-[11px] font-extrabold">
                        {vacancy.contract_duration}
                    </Text>
                </View>
                {(vacancy.benefits || ['Accommodation', 'Meals', 'Flight']).map((b) => (
                    <View key={b} className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        <Text className="text-amber-900 text-[11px] font-extrabold">{b}</Text>
                    </View>
                ))}
            </View>

            <View className="flex-row items-center justify-between mt-3 pt-2">
                <View className="flex-row items-center gap-1">
                    <Clock size={12} color="#94A3B8" />
                    <Text className="text-slate-400 text-[11px] font-medium">
                        Deadline: {vacancy.deadline || '30 Sep 2026'}
                    </Text>
                </View>
                <Text className="text-slate-900 text-xs font-black">View Job Details →</Text>
            </View>
        </Pressable>
    );
}

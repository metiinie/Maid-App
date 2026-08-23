import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ShieldCheck, Video, Globe, Award } from 'lucide-react-native';

export interface CandidateProps {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
    experience_years: number;
    medical_status: 'Cleared' | 'Pending' | 'Not started';
    languages: string[];
    video_url?: string;
    avatar_initials?: string;
    avatar_bg?: string;
}

interface CandidateCardProps {
    candidate: CandidateProps;
    onPress: () => void;
    onVideoPress?: () => void;
}

export function CandidateCard({ candidate, onPress, onVideoPress }: CandidateCardProps) {
    const initials = candidate.avatar_initials || `${candidate.first_name?.[0] || 'T'}${candidate.last_name?.[0] || 'W'}`;
    const bg = candidate.avatar_bg || 'bg-slate-900';

    return (
        <Pressable
            onPress={onPress}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden mb-3 shadow-xs active:opacity-95"
        >
            {/* Candidate Header Avatar Banner */}
            <View className={`w-full h-36 ${bg} items-center justify-center relative`}>
                <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center border-4 border-white shadow-md">
                    <Text className="text-slate-950 font-black text-2xl">{initials}</Text>
                </View>
                {candidate.video_url && (
                    <Pressable
                        onPress={onVideoPress || onPress}
                        className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border border-white/20"
                    >
                        <Video size={14} color="#F59E0B" />
                        <Text className="text-white text-[11px] font-extrabold">60s Video</Text>
                    </Pressable>
                )}
            </View>

            {/* Candidate Card Body */}
            <View className="p-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-slate-900 text-base font-black">
                            {candidate.first_name} {candidate.last_name}
                        </Text>
                        <Text className="text-slate-500 text-xs font-semibold mt-0.5">
                            {candidate.role}
                        </Text>
                    </View>

                    {/* Verified Medical Clearance Badge */}
                    <View
                        className={`px-3 py-1 rounded-full flex-row items-center gap-1 ${candidate.medical_status === 'Cleared'
                            ? 'bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-100 border border-amber-200'
                            }`}
                    >
                        <ShieldCheck
                            size={14}
                            color={candidate.medical_status === 'Cleared' ? '#065F46' : '#D97706'}
                        />
                        <Text
                            className={`text-[11px] font-extrabold ${candidate.medical_status === 'Cleared' ? 'text-emerald-900' : 'text-amber-900'
                                }`}
                        >
                            {candidate.medical_status}
                        </Text>
                    </View>
                </View>

                {/* Skill & Language Chips */}
                <View className="flex-row items-center flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    <View className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        <Text className="text-slate-700 text-[11px] font-extrabold">
                            {candidate.experience_years} yrs exp
                        </Text>
                    </View>
                    {(candidate.languages || ['Arabic', 'English', 'Amharic']).map((lang) => (
                        <View
                            key={lang}
                            className={`px-2.5 py-1 rounded-full border ${lang === 'Arabic'
                                ? 'bg-amber-100 border-amber-200'
                                : 'bg-sky-100 border-sky-200'
                                }`}
                        >
                            <Text
                                className={`text-[11px] font-extrabold ${lang === 'Arabic' ? 'text-amber-900' : 'text-sky-900'
                                    }`}
                            >
                                {lang}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </Pressable>
    );
}

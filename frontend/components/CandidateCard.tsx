import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ShieldCheck, Video, Globe, Award, Bookmark, MessageSquare } from 'lucide-react-native';

export interface CandidateProps {
    id: string;
    code?: string;
    first_name: string;
    last_name: string;
    role: string;
    experience_years: number;
    medical_status: 'Cleared' | 'Pending' | 'Not started';
    languages: string[];
    video_url?: string;
    avatar_initials?: string;
    avatar_bg?: string;
    agency_id?: string;
    agency_name?: string;
}

interface CandidateCardProps {
    candidate: CandidateProps;
    isSaved?: boolean;
    onPress: () => void;
    onVideoPress?: () => void;
    onBookmarkPress?: () => void;
    onChatPress?: () => void;
}

export function CandidateCard({
    candidate,
    isSaved,
    onPress,
    onVideoPress,
    onBookmarkPress,
    onChatPress,
}: CandidateCardProps) {
    const initials = candidate.avatar_initials || `${candidate.first_name?.[0] || 'T'}${candidate.last_name?.[0] || 'W'}`;
    const bg = candidate.avatar_bg || 'bg-slate-900';

    return (
        <View className="bg-white border border-slate-200 rounded-3xl overflow-hidden mb-3 shadow-xs">
            <Pressable onPress={onPress} className="active:opacity-95">
                {/* Candidate Header Avatar Banner */}
                <View className={`w-full h-36 ${bg} items-center justify-center relative`}>
                    <View className="w-20 h-20 rounded-full bg-amber-500 items-center justify-center border-4 border-white shadow-md">
                        <Text className="text-slate-950 font-black text-2xl">{initials}</Text>
                    </View>

                    {/* Ref Code Badge */}
                    <View className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700 px-2.5 py-1 rounded-md">
                        <Text className="text-amber-400 text-[10px] font-extrabold uppercase">
                            Ref: {candidate.code || `ET-${candidate.id}`}
                        </Text>
                    </View>

                    {/* Bookmark Button */}
                    {onBookmarkPress && (
                        <Pressable
                            onPress={onBookmarkPress}
                            className={`absolute top-3 right-3 p-2 rounded-full border ${isSaved ? 'bg-amber-500 border-amber-600' : 'bg-slate-900/80 border-white/20'}`}
                        >
                            <Bookmark size={15} color={isSaved ? '#0F172A' : '#FFFFFF'} fill={isSaved ? '#0F172A' : 'transparent'} />
                        </Pressable>
                    )}

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
                            <Text className="text-emerald-700 text-xs font-bold mt-0.5">
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

                    {/* Action Footer */}
                    <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                        <Pressable
                            onPress={onPress}
                            className="flex-1 bg-slate-900 py-2.5 rounded-xl items-center justify-center"
                        >
                            <Text className="text-amber-400 text-xs font-bold">Inspect Profile</Text>
                        </Pressable>

                        {onChatPress && (
                            <Pressable
                                onPress={onChatPress}
                                className="flex-1 bg-emerald-600 py-2.5 rounded-xl items-center justify-center flex-row gap-1"
                            >
                                <MessageSquare size={13} color="#FFFFFF" />
                                <Text className="text-white text-xs font-bold">Chat Agency</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Pressable>
        </View>
    );
}


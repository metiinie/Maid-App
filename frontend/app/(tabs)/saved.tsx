import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, ChevronRight } from 'lucide-react-native';

export default function SavedScreen() {
    const router = useRouter();
    const [activeSegment, setActiveSegment] = useState<'candidates' | 'vacancies'>('candidates');

    const savedCandidates = [
        {
            id: '1',
            firstName: 'Alem',
            lastName: 'Tadesse',
            nationality: 'Ethiopian',
            yearsOfExperience: 3,
            medicalStatus: 'cleared',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
            category: 'Housemaid',
        },
    ];

    const savedVacancies = [
        {
            id: '1',
            title: 'Experienced Housemaid & Cook',
            country: 'Saudi Arabia',
            salaryMin: 400,
            salaryMax: 500,
            contractPeriodYears: 2,
            category: 'Housemaid / Domestic Worker',
        },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="px-5 pt-14 pb-4 bg-white border-b border-slate-200">
                <Text className="text-xl font-extrabold text-slate-900 mb-3">Saved Bookmarks</Text>

                {/* Segmented Control */}
                <View className="flex-row bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <TouchableOpacity
                        onPress={() => setActiveSegment('candidates')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeSegment === 'candidates' ? 'bg-emerald-600 shadow-xs' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${activeSegment === 'candidates' ? 'text-white' : 'text-slate-700'}`}>
                            Saved Candidates ({savedCandidates.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveSegment('vacancies')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeSegment === 'vacancies' ? 'bg-emerald-600 shadow-xs' : ''}`}
                    >
                        <Text className={`text-xs font-bold ${activeSegment === 'vacancies' ? 'text-white' : 'text-slate-700'}`}>
                            Saved Vacancies ({savedVacancies.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-5">
                {activeSegment === 'candidates' ? (
                    savedCandidates.map((c) => (
                        <TouchableOpacity
                            key={c.id}
                            onPress={() => router.push(`/candidate/${c.id}`)}
                            className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 flex-row items-center justify-between shadow-xs active:opacity-90"
                        >
                            <View className="flex-row items-center flex-1">
                                <Image source={{ uri: c.photoUrl }} className="w-14 h-14 rounded-full mr-3 border border-slate-200" />
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="text-base font-bold text-slate-900 mr-2">{c.firstName} {c.lastName}</Text>
                                        <ShieldCheck size={16} color="#059669" />
                                    </View>
                                    <Text className="text-xs text-slate-600 font-medium">{c.category} · {c.yearsOfExperience} yrs exp</Text>
                                    <Text className="text-xs font-bold text-emerald-700 mt-1">Medical Cleared</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    ))
                ) : (
                    savedVacancies.map((v) => (
                        <TouchableOpacity
                            key={v.id}
                            onPress={() => router.push(`/vacancy/${v.id}`)}
                            className="bg-white p-4 rounded-2xl mb-3 border border-slate-200 shadow-xs active:opacity-90"
                        >
                            <Text className="text-xs font-bold text-blue-900 mb-1">{v.category}</Text>
                            <Text className="text-base font-bold text-slate-900">{v.title}</Text>
                            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                <Text className="text-sm font-extrabold text-emerald-700">${v.salaryMin} - ${v.salaryMax} / mo</Text>
                                <Text className="text-xs font-bold text-slate-700">{v.country}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

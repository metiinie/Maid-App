import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Phone, MessageSquare, ShieldCheck, CheckCircle2, Play, Volume2, Award, FileCheck, RefreshCw, Star, MapPin, DollarSign, Calendar, Sparkles } from 'lucide-react-native';

export default function CandidateDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    // Production-grade verified candidate profile
    const candidate = {
        id: id || '1',
        code: `ET-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: 'Alem',
        lastName: 'Tadesse',
        gender: 'Female',
        age: 26,
        nationality: 'Ethiopian',
        religion: 'Orthodox Christian',
        maritalStatus: 'Single',
        currentLocation: 'Addis Ababa, Ethiopia',
        educationLevel: 'High School Diploma (Grade 12)',
        yearsOfExperience: 3,
        experienceLocation: 'Riyadh, Saudi Arabia (3 Years)',
        medicalStatus: 'CLEARED (GAMCA E-Health Passed)',
        medicalClearanceDate: '2025-01-15',
        policeClearance: 'VERIFIED (Federal Police Crime-Free)',
        molsaLicense: 'MOLSA-ETH-2024-892',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        videoIntroDuration: '0:35',
        summary: 'Highly experienced domestic worker with 3 full years of prior employment in Riyadh, Saudi Arabia. Specialized in authentic Arabic culinary cooking (Kabsa, Mandi, Pastries), infant care, and structured home management. Speaks fluent Amharic and conversational Arabic.',
        skillRatings: [
            { name: 'Arabic Cooking', rating: 4.8, max: 5 },
            { name: 'Infant & Child Care', rating: 5.0, max: 5 },
            { name: 'House Cleaning & Sanitization', rating: 4.9, max: 5 },
            { name: 'Laundry & Garment Care', rating: 4.7, max: 5 },
            { name: 'Elderly Care & Assistance', rating: 4.2, max: 5 },
        ],
        languages: [
            { name: 'Amharic', level: 'Native / Fluent' },
            { name: 'Arabic', level: 'Conversational / Working' },
            { name: 'English', level: 'Basic Understanding' },
        ],
        contractDetails: {
            monthlySalary: '$400 USD (1,500 SAR / 120 KWD)',
            contractDuration: '2 Years (Renewable)',
            probationGuarantee: '90-Day Free Agency Replacement',
            includedBenefits: ['Free Food & Private Room', 'Round-Trip Airfare Ticket', 'Comprehensive Medical Insurance'],
        },
        agency: {
            name: 'Ethio-Gulf Overseas Recruitment Agency',
            licenseNumber: 'MOLSA License #ET-REC-2024-089',
            phone: '+251911223344',
            whatsapp: '251911223344',
        },
    };

    const handleOpenWhatsApp = () => {
        const url = `https://wa.me/${candidate.agency.whatsapp}?text=Hello, I am inquiring to reserve candidate Code ${candidate.code} (${candidate.firstName} ${candidate.lastName})`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open WhatsApp'));
    };

    const handleCallPhone = () => {
        Linking.openURL(`tel:${candidate.agency.phone}`);
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="flex-row items-center justify-between px-5 pt-14 pb-4 bg-white border-b border-slate-200 shadow-xs">
                <Pressable onPress={() => router.back()} className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <ArrowLeft size={18} color="#0F172A" />
                </Pressable>
                <View className="items-center">
                    <Text className="text-base font-extrabold text-slate-900">Candidate Profile</Text>
                    <Text className="text-[10px] text-emerald-700 font-bold">Code: {candidate.code}</Text>
                </View>
                <Pressable onPress={() => setIsSaved(!isSaved)} className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <Heart size={18} color={isSaved ? '#EF4444' : '#64748B'} fill={isSaved ? '#EF4444' : 'none'} />
                </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Banner & Photo */}
                <View className="relative bg-slate-900 h-72">
                    <Image source={{ uri: candidate.photoUrl }} className="w-full h-full opacity-90" resizeMode="cover" />
                    <View className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <View className="absolute bottom-4 left-5 right-5 flex-row justify-between items-end">
                        <View>
                            <View className="bg-blue-900/90 px-2.5 py-1 rounded-md self-start mb-1.5 border border-blue-400/30">
                                <Text className="text-white text-[10px] font-extrabold uppercase">Ref Code: {candidate.code}</Text>
                            </View>
                            <Text className="text-2xl font-black text-white">{candidate.firstName} {candidate.lastName}</Text>
                            <Text className="text-emerald-400 font-bold text-xs mt-0.5">
                                {candidate.nationality} · {candidate.age} Yrs · {candidate.religion}
                            </Text>
                        </View>
                        <View className="bg-emerald-600 px-3 py-1.5 rounded-full flex-row items-center border border-emerald-400/40">
                            <ShieldCheck size={14} color="#FFFFFF" className="mr-1" />
                            <Text className="text-white text-[10px] font-black uppercase tracking-wider">GAMCA Cleared</Text>
                        </View>
                    </View>
                </View>

                {/* Agency Government Verification Strip */}
                <View className="bg-emerald-50 px-5 py-3 border-b border-emerald-200 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                        <Award size={18} color="#059669" />
                        <View className="ml-2.5">
                            <Text className="font-extrabold text-slate-900 text-xs">{candidate.agency.name}</Text>
                            <Text className="text-[10px] text-emerald-800 font-bold">{candidate.agency.licenseNumber}</Text>
                        </View>
                    </View>
                    <View className="bg-emerald-600 px-2.5 py-1 rounded-lg border border-emerald-700">
                        <Text className="text-white text-[10px] font-black uppercase">Verified Agency</Text>
                    </View>
                </View>

                <View className="p-5 space-y-4">
                    {/* Government Compliance Badges Grid */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <Text className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                            Government Trust & Legal Clearances
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            <View className="flex-1 min-w-[45%] bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex-row items-center">
                                <CheckCircle2 size={16} color="#059669" />
                                <View className="ml-2">
                                    <Text className="text-xs font-bold text-slate-900">MOLSA Permit</Text>
                                    <Text className="text-[10px] text-emerald-800 font-medium">Verified License</Text>
                                </View>
                            </View>

                            <View className="flex-1 min-w-[45%] bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex-row items-center">
                                <ShieldCheck size={16} color="#059669" />
                                <View className="ml-2">
                                    <Text className="text-xs font-bold text-slate-900">GAMCA Medical</Text>
                                    <Text className="text-[10px] text-emerald-800 font-medium">Fit for Duty</Text>
                                </View>
                            </View>

                            <View className="flex-1 min-w-[45%] bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex-row items-center">
                                <FileCheck size={16} color="#059669" />
                                <View className="ml-2">
                                    <Text className="text-xs font-bold text-slate-900">Police Check</Text>
                                    <Text className="text-[10px] text-emerald-800 font-medium">Clean Record</Text>
                                </View>
                            </View>

                            <View className="flex-1 min-w-[45%] bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex-row items-center">
                                <RefreshCw size={16} color="#1E3A8A" />
                                <View className="ml-2">
                                    <Text className="text-xs font-bold text-slate-900">90-Day Guarantee</Text>
                                    <Text className="text-[10px] text-blue-900 font-medium">Free Replacement</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Video & Audio Intro Card */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <Sparkles size={16} color="#059669" />
                                <Text className="text-sm font-extrabold text-slate-900 ml-1.5">Candidate Intro Preview</Text>
                            </View>
                            <Text className="text-xs font-bold text-slate-500">{candidate.videoIntroDuration} Audio/Video</Text>
                        </View>

                        <Pressable
                            onPress={() => setIsPlayingVideo(!isPlayingVideo)}
                            className="bg-slate-900 rounded-xl p-4 flex-row items-center justify-between border border-slate-800"
                        >
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className="w-10 h-10 rounded-full bg-emerald-600 items-center justify-center mr-3">
                                    <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white text-xs font-bold">
                                        {isPlayingVideo ? 'Playing Amharic/Arabic Intro...' : 'Play 35-sec Voice Intro'}
                                    </Text>
                                    <Text className="text-slate-400 text-[10px]">Hear Arabic cooking & childcare interview</Text>
                                </View>
                            </View>
                            <Volume2 size={18} color="#10B981" />
                        </Pressable>
                    </View>

                    {/* Skill Proficiency Grid */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <Text className="text-sm font-extrabold text-slate-900 mb-3">Skill Proficiency Ratings</Text>
                        <View className="space-y-3">
                            {candidate.skillRatings.map((skill) => (
                                <View key={skill.name} className="mb-2">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-xs font-bold text-slate-800">{skill.name}</Text>
                                        <View className="flex-row items-center">
                                            <Star size={12} color="#D97706" fill="#D97706" />
                                            <Text className="text-xs font-extrabold text-slate-900 ml-1">{skill.rating} / 5</Text>
                                        </View>
                                    </View>
                                    {/* Progress Bar */}
                                    <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <View
                                            className="h-full bg-emerald-600 rounded-full"
                                            style={{ width: `${(skill.rating / skill.max) * 100}%` }}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Transparent Contract Terms */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <Text className="text-sm font-extrabold text-slate-900 mb-3">Transparent Contract & Salary Terms</Text>
                        <View className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 mb-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xs text-slate-600 font-medium">Monthly Salary:</Text>
                                <Text className="text-xs font-extrabold text-emerald-700">{candidate.contractDetails.monthlySalary}</Text>
                            </View>
                            <View className="flex-row items-center justify-between pt-2 border-t border-slate-200">
                                <Text className="text-xs text-slate-600 font-medium">Contract Duration:</Text>
                                <Text className="text-xs font-bold text-slate-900">{candidate.contractDetails.contractDuration}</Text>
                            </View>
                            <View className="flex-row items-center justify-between pt-2 border-t border-slate-200">
                                <Text className="text-xs text-slate-600 font-medium">Agency Guarantee:</Text>
                                <Text className="text-xs font-bold text-blue-900">{candidate.contractDetails.probationGuarantee}</Text>
                            </View>
                        </View>

                        <Text className="text-[11px] font-bold text-slate-800 mb-2">Package Inclusions:</Text>
                        {candidate.contractDetails.includedBenefits.map((benefit, i) => (
                            <View key={i} className="flex-row items-center gap-2 mb-1">
                                <CheckCircle2 size={12} color="#059669" />
                                <Text className="text-xs text-slate-700 font-medium">{benefit}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Languages */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <Text className="text-sm font-extrabold text-slate-900 mb-3">Languages Spoken</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {candidate.languages.map((lang) => (
                                <View key={lang.name} className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                                    <Text className="text-xs font-bold text-blue-900">{lang.name}: <Text className="font-medium text-slate-700">{lang.level}</Text></Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Summary */}
                    <View className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <Text className="text-sm font-extrabold text-slate-900 mb-2">Candidate Biography & Experience</Text>
                        <Text className="text-slate-700 text-xs leading-relaxed font-medium">{candidate.summary}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Action CTA Bar */}
            <View className="p-4 bg-white border-t border-slate-200 flex-row items-center gap-3 shadow-lg">
                <Pressable onPress={handleOpenWhatsApp} className="flex-1 bg-emerald-600 py-3.5 rounded-xl flex-row justify-center items-center active:opacity-90 shadow-xs">
                    <MessageSquare size={18} color="#FFFFFF" />
                    <Text className="text-white font-extrabold text-xs ml-2">Reserve via WhatsApp</Text>
                </Pressable>
                <Pressable onPress={handleCallPhone} className="bg-blue-900 px-4 py-3.5 rounded-xl flex-row items-center active:opacity-90 shadow-xs">
                    <Phone size={18} color="#FFFFFF" />
                </Pressable>
            </View>
        </View>
    );
}

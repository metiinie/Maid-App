import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Phone, MessageSquare, ShieldCheck, CheckCircle2, MapPin, Award, Calendar, UserCheck } from 'lucide-react-native';

export default function CandidateDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);
    const [inquiryModalVisible, setInquiryModalVisible] = useState(false);

    // Mocked candidate data structure matching production schema
    const candidate = {
        id: id || '1',
        firstName: 'Alem',
        lastName: 'Tadesse',
        gender: 'Female',
        dateOfBirth: '1998-04-12',
        nationality: 'Ethiopian',
        religion: 'Orthodox',
        maritalStatus: 'Single',
        currentCountry: 'Ethiopia',
        city: 'Addis Ababa',
        educationLevel: 'High School Complete',
        yearsOfExperience: 3,
        medicalStatus: 'cleared',
        medicalClearanceDate: '2025-01-15',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        summary: 'Experienced housemaid with 3 years overseas experience in Riyadh. Skilled in cooking, child care, and housekeeping. Fluent in Amharic and basic Arabic.',
        skills: ['Housekeeping', 'Cooking (Middle Eastern)', 'Child Care', 'Elderly Care', 'Laundry'],
        languages: ['Amharic (Native)', 'Arabic (Conversational)', 'English (Basic)'],
        agency: {
            name: 'Ethio-Gulf Overseas Recruitment Agency',
            phone: '+251911223344',
            whatsapp: '251911223344',
            telegram: 'EthioGulfRecruitment',
        },
    };

    const handleOpenWhatsApp = () => {
        const url = `https://wa.me/${candidate.agency.whatsapp}?text=Hello, I am inquiring about candidate ${candidate.firstName} ${candidate.lastName} (Ref #${candidate.id})`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open WhatsApp'));
    };

    const handleOpenTelegram = () => {
        const url = `https://t.me/${candidate.agency.telegram}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open Telegram'));
    };

    const handleCallPhone = () => {
        Linking.openURL(`tel:${candidate.agency.phone}`);
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Navigation Bar */}
            <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-slate-100">
                    <ArrowLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Candidate Profile</Text>
                <TouchableOpacity onPress={() => setIsSaved(!isSaved)} className="p-2 rounded-full bg-slate-100">
                    <Heart size={20} color={isSaved ? '#EF4444' : '#64748B'} fill={isSaved ? '#EF4444' : 'none'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Candidate Banner & Photo */}
                <View className="relative bg-slate-900 h-72">
                    <Image source={{ uri: candidate.photoUrl }} className="w-full h-full opacity-90" resizeMode="cover" />
                    <View className="absolute bottom-4 left-4 right-4 flex-row justify-between items-end">
                        <View>
                            <Text className="text-2xl font-bold text-white">{candidate.firstName} {candidate.lastName}</Text>
                            <Text className="text-emerald-400 font-semibold">{candidate.nationality} · {candidate.gender}</Text>
                        </View>
                        <View className="bg-emerald-500/90 px-3 py-1.5 rounded-full flex-row items-center">
                            <ShieldCheck size={16} color="#FFFFFF" className="mr-1" />
                            <Text className="text-white text-xs font-bold uppercase">Medical Cleared</Text>
                        </View>
                    </View>
                </View>

                {/* Agency Info Header */}
                <View className="bg-emerald-50 p-4 border-b border-emerald-100 flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <UserCheck size={20} color="#10B981" />
                        <Text className="ml-2 font-bold text-slate-800 text-sm">{candidate.agency.name}</Text>
                    </View>
                    <Text className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">Verified Agency</Text>
                </View>

                {/* Profile Overview */}
                <View className="p-4 space-y-4">
                    {/* Quick Stats Grid */}
                    <View className="flex-row flex-wrap justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <View className="w-1/2 mb-3">
                            <Text className="text-xs text-slate-400 font-medium">Experience</Text>
                            <Text className="text-base font-bold text-slate-800">{candidate.yearsOfExperience} Years</Text>
                        </View>
                        <View className="w-1/2 mb-3">
                            <Text className="text-xs text-slate-400 font-medium">Education</Text>
                            <Text className="text-base font-bold text-slate-800">{candidate.educationLevel}</Text>
                        </View>
                        <View className="w-1/2">
                            <Text className="text-xs text-slate-400 font-medium">Religion</Text>
                            <Text className="text-base font-bold text-slate-800">{candidate.religion}</Text>
                        </View>
                        <View className="w-1/2">
                            <Text className="text-xs text-slate-400 font-medium">Marital Status</Text>
                            <Text className="text-base font-bold text-slate-800">{candidate.maritalStatus}</Text>
                        </View>
                    </View>

                    {/* Professional Summary */}
                    <View className="bg-white p-4 rounded-xl border border-slate-200">
                        <Text className="text-sm font-bold text-slate-900 mb-2">Professional Summary</Text>
                        <Text className="text-slate-600 text-sm leading-relaxed">{candidate.summary}</Text>
                    </View>

                    {/* Key Skills */}
                    <View className="bg-white p-4 rounded-xl border border-slate-200">
                        <Text className="text-sm font-bold text-slate-900 mb-3">Skills & Capabilities</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {candidate.skills.map((skill, index) => (
                                <View key={index} className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex-row items-center">
                                    <CheckCircle2 size={14} color="#10B981" />
                                    <Text className="text-xs font-semibold text-emerald-800 ml-1.5">{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Spoken Languages */}
                    <View className="bg-white p-4 rounded-xl border border-slate-200">
                        <Text className="text-sm font-bold text-slate-900 mb-2">Languages Spoken</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {candidate.languages.map((lang, index) => (
                                <View key={index} className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                    <Text className="text-xs font-semibold text-blue-800">{lang}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action CTA Bar */}
            <View className="p-4 bg-white border-t border-slate-200 flex-row items-center space-x-3">
                <TouchableOpacity onPress={handleOpenWhatsApp} className="flex-1 bg-emerald-500 py-3.5 rounded-xl flex-row justify-center items-center">
                    <MessageSquare size={18} color="#FFFFFF" />
                    <Text className="text-white font-bold text-sm ml-2">WhatsApp Agency</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCallPhone} className="bg-slate-900 px-4 py-3.5 rounded-xl flex-row items-center">
                    <Phone size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

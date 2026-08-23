import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
    ShieldCheck,
    Search,
    Building2,
    Briefcase,
    Globe,
    Lock,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { RoleToggle } from '../../components/RoleToggle';
import { CandidateCard, CandidateProps } from '../../components/CandidateCard';
import { VacancyCard, VacancyProps } from '../../components/VacancyCard';
import { InquiryModal } from '../../components/InquiryModal';

const sampleCandidates: CandidateProps[] = [
    {
        id: 'cand-1',
        first_name: 'Tigist',
        last_name: 'Wolde',
        role: 'Experienced Domestic Worker',
        experience_years: 5,
        medical_status: 'Cleared',
        languages: ['Arabic', 'English', 'Amharic'],
        video_url: 'https://sample-video.mp4',
        avatar_initials: 'TW',
        avatar_bg: 'bg-slate-900',
    },
    {
        id: 'cand-2',
        first_name: 'Biruk',
        last_name: 'Getachew',
        role: 'Professional Heavy Vehicle Driver',
        experience_years: 8,
        medical_status: 'Cleared',
        languages: ['Arabic', 'Amharic'],
        video_url: 'https://sample-video.mp4',
        avatar_initials: 'BG',
        avatar_bg: 'bg-amber-600',
    },
    {
        id: 'cand-3',
        first_name: 'Almaz',
        last_name: 'Mekonnen',
        role: 'Executive Chef & Household Cook',
        experience_years: 3,
        medical_status: 'Cleared',
        languages: ['English', 'Amharic'],
        avatar_initials: 'AM',
        avatar_bg: 'bg-emerald-800',
    },
];

const sampleVacancies: VacancyProps[] = [
    {
        id: 'vac-1',
        title: 'Domestic Worker',
        country: 'Saudi Arabia',
        country_flag: '🇸🇦',
        salary_range: 'SAR 1,200 – 1,600 / month',
        contract_duration: '2-year contract',
        employer_type: 'Family Household',
        positions_available: 2,
        deadline: '30 Sep 2026',
        benefits: ['Accommodation', 'Meals Provided', 'Flight Ticket'],
    },
    {
        id: 'vac-2',
        title: 'Professional Driver',
        country: 'UAE',
        country_flag: '🇦🇪',
        salary_range: 'AED 2,500 – 3,500 / month',
        contract_duration: '1-year contract',
        employer_type: 'Corporate Logistics',
        positions_available: 5,
        deadline: '15 Oct 2026',
        benefits: ['Accommodation', 'Health Insurance'],
    },
    {
        id: 'vac-3',
        title: 'Head Chef / Hospitality Cook',
        country: 'Qatar',
        country_flag: '🇶🇦',
        salary_range: 'QAR 3,000 – 4,500 / month',
        contract_duration: '2-year contract',
        employer_type: 'Hotel Group',
        positions_available: 3,
        deadline: '20 Oct 2026',
        benefits: ['Accommodation', 'Overtime Pay'],
    },
];

export default function HomeScreen() {
    const router = useRouter();
    const { user, admin, activeWorkspace } = useAuth();

    // Mode is derived from active workspace or defaults to employer
    const mode = activeWorkspace?.type === 'GULF_EMPLOYER' ? 'employer' : 'seeker';
    const [activeChip, setActiveChip] = useState('All');
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProps | null>(null);
    const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const isAuthenticated = !!user || !!admin;

    const handleSelectCandidate = (cand: CandidateProps) => {
        if (!isAuthenticated) {
            router.push('/(auth)/login');
            return;
        }
        setSelectedCandidate(cand);
        setInquiryModalVisible(true);
    };

    const categories = ['All', 'Domestic', 'Driver', 'Chef', 'Security', 'Nurse'];
    const countries = ['All Countries', '🇸🇦 Saudi', '🇦🇪 UAE', '🇶🇦 Qatar', '🇰🇼 Kuwait'];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Deep Navy Top Header (#0F172A) */}
            <View className="bg-slate-900 px-5 pt-14 pb-5 shadow-md">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-10 h-10 rounded-2xl bg-amber-500 items-center justify-center mr-3 shadow-xs">
                            <ShieldCheck size={22} color="#0F172A" strokeWidth={2.5} />
                        </View>
                        <View>
                            <View className="flex-row items-center">
                                <Text className="text-white text-base font-black tracking-wider uppercase">
                                    EthioHire
                                </Text>
                                <View className="ml-2 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    <Text className="text-amber-400 text-[9px] font-black uppercase">
                                        Verified SaaS
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-slate-400 text-[10px] font-medium mt-0.5">
                                Ethiopia ↔ Gulf Overseas Recruitment Platform
                            </Text>
                        </View>
                    </View>

                    {/* Mode Context Badge */}
                    <View className="bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full">
                        <Text className="text-amber-400 text-[10px] font-black uppercase">
                            {mode === 'employer' ? 'EMPLOYER FEED' : 'JOB SEEKER FEED'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Context Mode Banner */}
            <View
                className={`px-5 py-2.5 flex-row items-center justify-between ${mode === 'employer' ? 'bg-slate-900 border-b border-slate-800' : 'bg-amber-100 border-b border-amber-200'
                    }`}
            >
                <View className="flex-row items-center gap-2">
                    {mode === 'employer' ? (
                        <Building2 size={16} color="#F59E0B" />
                    ) : (
                        <Briefcase size={16} color="#D97706" />
                    )}
                    <Text
                        className={`text-xs font-extrabold ${mode === 'employer' ? 'text-white' : 'text-amber-950'
                            }`}
                    >
                        {mode === 'employer'
                            ? 'Employer Mode — Browsing Cleared Candidates'
                            : 'Job Seeker Mode — Browsing Overseas Vacancies'}
                    </Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/profile')} className="bg-white/20 px-2 py-0.5 rounded-md">
                    <Text
                        className={`text-[10px] font-bold ${mode === 'employer' ? 'text-amber-400' : 'text-amber-900'
                            }`}
                    >
                        Switch Role →
                    </Text>
                </Pressable>
            </View>

            {/* Unauthenticated Guest Sign-In Banner */}
            {!isAuthenticated && (
                <View className="bg-amber-500 px-5 py-3 flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-slate-950 text-xs font-black">Sign in to contact agencies & apply</Text>
                        <Text className="text-slate-900 text-[10px] font-semibold">Access verified candidate videos & job demand orders</Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/(auth)/login')}
                        className="bg-slate-900 px-3.5 py-1.5 rounded-full"
                    >
                        <Text className="text-amber-400 text-xs font-black">Sign In</Text>
                    </Pressable>
                </View>
            )}

            {/* Main Content Area */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="px-5 pt-4">
                    <View className="bg-white border border-slate-200 rounded-full px-4 py-3 flex-row items-center shadow-xs">
                        <Search size={18} color="#94A3B8" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder={
                                mode === 'employer'
                                    ? 'Search candidates by skill, experience, Arabic speaking…'
                                    : 'Search jobs by country, salary, domestic worker…'
                            }
                            className="flex-1 ml-2 text-slate-900 text-sm font-medium"
                        />
                    </View>
                </View>

                {/* Filter Chips Bar */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-5 my-3"
                >
                    {(mode === 'employer' ? categories : countries).map((chip) => {
                        const isActive = activeChip === chip;
                        return (
                            <Pressable
                                key={chip}
                                onPress={() => setActiveChip(chip)}
                                className={`mr-2 px-4 py-2 rounded-full border ${isActive
                                    ? 'bg-slate-900 border-slate-900'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${isActive ? 'text-amber-400 font-black' : 'text-slate-600'
                                        }`}
                                >
                                    {chip}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Content Section */}
                {mode === 'employer' ? (
                    <View className="px-5 pb-10">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-900 text-sm font-black uppercase tracking-wider">
                                Featured Verified Candidates
                            </Text>
                            <Text className="text-emerald-700 text-xs font-bold">
                                {sampleCandidates.length} Cleared
                            </Text>
                        </View>

                        {sampleCandidates.map((cand) => (
                            <CandidateCard
                                key={cand.id}
                                candidate={cand}
                                onPress={() => handleSelectCandidate(cand)}
                                onVideoPress={() => handleSelectCandidate(cand)}
                            />
                        ))}
                    </View>
                ) : (
                    <View className="px-5 pb-10">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-900 text-sm font-black uppercase tracking-wider">
                                Latest Overseas Job Vacancies
                            </Text>
                            <Text className="text-amber-700 text-xs font-bold">
                                {sampleVacancies.length} Verified
                            </Text>
                        </View>

                        {sampleVacancies.map((vac) => (
                            <VacancyCard
                                key={vac.id}
                                vacancy={vac}
                                onPress={() => {
                                    router.push('/(user)/dashboard');
                                }}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Direct Inquiry Modal */}
            <InquiryModal
                visible={inquiryModalVisible}
                candidate={selectedCandidate}
                onClose={() => setInquiryModalVisible(false)}
                onSuccess={() => { }}
            />
        </View>
    );
}


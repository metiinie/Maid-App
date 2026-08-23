import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    ShieldCheck,
    Search,
    Building2,
    Briefcase,
    Globe,
    Lock,
    X,
    Sparkles,
    MessageSquare,
    Filter,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { candidateService } from '../../services/candidateService';
import { vacancyService } from '../../services/vacancyService';
import { bookmarkService } from '../../services/bookmarkService';
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
    {
        id: 'cand-4',
        first_name: 'Genet',
        last_name: 'Tesfaye',
        role: 'Senior Caregiver & Nanny',
        experience_years: 6,
        medical_status: 'Cleared',
        languages: ['English', 'Amharic'],
        avatar_initials: 'GT',
        avatar_bg: 'bg-indigo-900',
    },
];

const sampleVacancies: VacancyProps[] = [
    {
        id: 'vac-1',
        title: 'Domestic Worker & Housekeeper',
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
        title: 'Professional Logistics Driver',
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
        title: 'Head Chef & Hospitality Cook',
        country: 'Qatar',
        country_flag: '🇶🇦',
        salary_range: 'QAR 3,000 – 4,500 / month',
        contract_duration: '2-year contract',
        employer_type: 'Hotel Group',
        positions_available: 3,
        deadline: '20 Oct 2026',
        benefits: ['Accommodation', 'Overtime Pay'],
    },
    {
        id: 'vac-4',
        title: 'Elderly Caregiver & Nurse Assistant',
        country: 'Kuwait',
        country_flag: '🇰🇼',
        salary_range: 'KWD 180 – 250 / month',
        contract_duration: '2-year contract',
        employer_type: 'Private Residence',
        positions_available: 4,
        deadline: '05 Nov 2026',
        benefits: ['Private Room', 'Medical Insurance', 'Flight Ticket'],
    },
];

export default function HomeScreen() {
    const router = useRouter();
    const { user, admin, activeWorkspace, switchWorkspace, workspaces } = useAuth();
    const { openChatWithAgency } = useChat();

    // Derived mode from active workspace (GULF_EMPLOYER -> employer, PERSONAL -> seeker)
    const mode = activeWorkspace?.type === 'GULF_EMPLOYER' ? 'employer' : 'seeker';

    const [activeChip, setActiveChip] = useState('All');
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProps | null>(null);
    const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModeBanner, setShowModeBanner] = useState(true);
    const [showGuestBanner, setShowGuestBanner] = useState(true);

    const [candidates, setCandidates] = useState<CandidateProps[]>(sampleCandidates);
    const [vacancies, setVacancies] = useState<VacancyProps[]>(sampleVacancies);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const isAuthenticated = !!user || !!admin;

    const [bookmarkedCandidateIds, setBookmarkedCandidateIds] = useState<string[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadFeedData(false);
            loadBookmarks();
        }, [mode])
    );

    async function loadBookmarks() {
        try {
            const list = await bookmarkService.getSavedCandidates();
            setBookmarkedCandidateIds(list.map((b: any) => b.id));
        } catch { }
    }

    const toggleCandidateBookmark = async (cand: CandidateProps) => {
        const isSaved = bookmarkedCandidateIds.includes(cand.id);
        await bookmarkService.toggleSaveCandidate({
            id: cand.id,
            firstName: cand.first_name,
            lastName: cand.last_name,
            category: cand.role,
            yearsOfExperience: cand.experience_years,
            medicalStatus: cand.medical_status === 'Cleared' ? 'Cleared' : 'Pending',
        });
        if (isSaved) {
            setBookmarkedCandidateIds((prev) => prev.filter((id) => id !== cand.id));
        } else {
            setBookmarkedCandidateIds((prev) => [...prev, cand.id]);
        }
    };

    const handleChatAgency = (cand: CandidateProps) => {
        openChatWithAgency(
            cand.agency_id || 'ag-1',
            cand.agency_name || 'Verified Ethiopian Manpower Agency',
            'candidate_inquiry',
            cand.id
        );
    };

    async function loadFeedData(showLoader = true) {
        if (showLoader) setLoading(true);
        try {
            if (mode === 'employer') {
                const res: any = await candidateService.getPublicCandidates();
                const list = res.data || [];
                if (list.length > 0) setCandidates(list);
            } else {
                const res: any = await vacancyService.getPublicVacancies();
                const list = res.data || [];
                if (list.length > 0) setVacancies(list);
            }
        } catch {
            // Keep sample datasets if backend call fails
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        loadFeedData(false);
        loadBookmarks();
    };

    const handleSelectCandidate = (cand: CandidateProps) => {
        if (!isAuthenticated) {
            router.push('/(auth)/login');
            return;
        }
        setSelectedCandidate(cand);
        setInquiryModalVisible(true);
    };

    const categories = ['All', 'Domestic', 'Driver', 'Chef', 'Caregiver', 'Security'];
    const countries = ['All Countries', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait'];

    // Search and Chip Filtering logic
    const filteredCandidates = candidates.filter((c) => {
        const queryMatch =
            !searchQuery ||
            `${c.first_name} ${c.last_name} ${c.role}`.toLowerCase().includes(searchQuery.toLowerCase());
        const chipMatch =
            activeChip === 'All' ||
            (activeChip === 'Domestic' && c.role.toLowerCase().includes('domestic')) ||
            (activeChip === 'Driver' && c.role.toLowerCase().includes('driver')) ||
            (activeChip === 'Chef' && (c.role.toLowerCase().includes('cook') || c.role.toLowerCase().includes('chef'))) ||
            (activeChip === 'Caregiver' && c.role.toLowerCase().includes('caregiver'));
        return queryMatch && chipMatch;
    });

    const filteredVacancies = vacancies.filter((v) => {
        const queryMatch =
            !searchQuery ||
            `${v.title} ${v.country} ${v.employer_type}`.toLowerCase().includes(searchQuery.toLowerCase());
        const chipMatch =
            activeChip === 'All' ||
            activeChip === 'All Countries' ||
            v.country.toLowerCase().includes(activeChip.toLowerCase());
        return queryMatch && chipMatch;
    });

    return (
        <View className="flex-1 bg-slate-50">
            {/* Deep Navy Header */}
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
                                Ethiopia ↔ Middle East Corridor
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

            {/* Context Mode Banner (Dismissable & Interactive 1-Tap Quick Switch) */}
            {showModeBanner && (
                <View
                    className={`px-5 py-2.5 flex-row items-center justify-between shadow-xs ${mode === 'employer' ? 'bg-slate-900 border-b border-slate-800' : 'bg-amber-500 border-b border-amber-600'
                        }`}
                >
                    <View className="flex-row items-center gap-2 flex-1 mr-2">
                        {mode === 'employer' ? (
                            <Building2 size={16} color="#F59E0B" />
                        ) : (
                            <Briefcase size={16} color="#0F172A" />
                        )}
                        <View className="flex-1">
                            <Text
                                className={`text-xs font-black ${mode === 'employer' ? 'text-white' : 'text-slate-950'
                                    }`}
                            >
                                {mode === 'employer'
                                    ? 'Employer UI — Switch to Job Seeker UI?'
                                    : 'Job Seeker UI — Switch to Employer UI?'}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <Pressable
                            onPress={async () => {
                                const targetType = mode === 'employer' ? 'PERSONAL' : 'GULF_EMPLOYER';
                                const target = workspaces.find((w) => w.type === targetType) || workspaces[0];
                                if (target) {
                                    await switchWorkspace(target.id);
                                }
                            }}
                            className={`px-3 py-1.5 rounded-full shadow-xs ${mode === 'employer' ? 'bg-amber-500' : 'bg-slate-900'
                                }`}
                        >
                            <Text
                                className={`text-[11px] font-black uppercase ${mode === 'employer' ? 'text-slate-950' : 'text-amber-400'
                                    }`}
                            >
                                {mode === 'employer' ? 'Switch to Job Seeker →' : 'Switch to Employer →'}
                            </Text>
                        </Pressable>
                        <Pressable onPress={() => setShowModeBanner(false)} className="p-1">
                            <X size={15} color={mode === 'employer' ? '#94A3B8' : '#0F172A'} />
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Unauthenticated Guest Sign-In Banner */}
            {!isAuthenticated && showGuestBanner && (
                <View className="bg-amber-500 px-5 py-2.5 flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                        <Text className="text-slate-950 text-xs font-black">Sign in to contact agencies & apply</Text>
                        <Text className="text-slate-900 text-[10px] font-semibold">Access verified candidate videos & job demand orders</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Pressable
                            onPress={() => router.push('/(auth)/login')}
                            className="bg-slate-900 px-3 py-1.5 rounded-full"
                        >
                            <Text className="text-amber-400 text-xs font-black">Sign In</Text>
                        </Pressable>
                        <Pressable onPress={() => setShowGuestBanner(false)} className="p-1">
                            <X size={16} color="#0F172A" />
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Main Content Area */}
            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />}
                showsVerticalScrollIndicator={false}
            >
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
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')} className="p-1">
                                <X size={16} color="#94A3B8" />
                            </Pressable>
                        )}
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
                {loading ? (
                    <ActivityIndicator color="#059669" size="large" className="mt-10" />
                ) : mode === 'employer' ? (
                    <View className="px-5 pb-10">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-900 text-sm font-black uppercase tracking-wider">
                                Featured Verified Candidates
                            </Text>
                            <Text className="text-emerald-700 text-xs font-bold">
                                {filteredCandidates.length} Cleared
                            </Text>
                        </View>

                        {filteredCandidates.length === 0 ? (
                            <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-2">
                                <Search size={28} color="#94A3B8" />
                                <Text className="text-slate-900 text-xs font-bold mt-2">No matching candidates found</Text>
                            </View>
                        ) : (
                            filteredCandidates.map((cand) => (
                                <CandidateCard
                                    key={cand.id}
                                    candidate={cand}
                                    onPress={() => handleSelectCandidate(cand)}
                                    onVideoPress={() => handleSelectCandidate(cand)}
                                />
                            ))
                        )}
                    </View>
                ) : (
                    <View className="px-5 pb-10">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-slate-900 text-sm font-black uppercase tracking-wider">
                                Latest Overseas Job Vacancies
                            </Text>
                            <Text className="text-amber-700 text-xs font-bold">
                                {filteredVacancies.length} Verified
                            </Text>
                        </View>

                        {filteredVacancies.length === 0 ? (
                            <View className="bg-white p-8 rounded-2xl border border-slate-200 items-center justify-center mt-2">
                                <Search size={28} color="#94A3B8" />
                                <Text className="text-slate-900 text-xs font-bold mt-2">No matching job vacancies found</Text>
                            </View>
                        ) : (
                            filteredVacancies.map((vac) => (
                                <VacancyCard
                                    key={vac.id}
                                    vacancy={vac}
                                    onPress={() => {
                                        router.push(`/vacancy/${vac.id}` as any);
                                    }}
                                />
                            ))
                        )}
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



import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Briefcase, MapPin, DollarSign, Calendar, Clock, ShieldCheck, CheckCircle2, Building2, Send } from 'lucide-react-native';

export default function VacancyDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');

    // Mock vacancy detail matching schema
    const vacancy = {
        id: id || '1',
        title: 'Experienced Housemaid & Cook',
        country: 'Saudi Arabia',
        city: 'Riyadh',
        category: { name: 'Housemaid / Domestic Worker' },
        salaryMin: 400,
        salaryMax: 500,
        salaryCurrency: 'USD',
        contractPeriodYears: 2,
        workingHoursPerDay: 8,
        workingDaysPerWeek: 6,
        visaSponsorship: true,
        accommodationProvided: true,
        mealsProvided: true,
        transportationProvided: true,
        healthInsurance: true,
        annualLeaveDays: 30,
        genderPreference: 'Female',
        ageMin: 21,
        ageMax: 40,
        experienceRequired: 1,
        description: 'A respected family in Riyadh is seeking a trustworthy and skilled Ethiopian housemaid with experience in housekeeping, family cooking, and household management. Full visa sponsorship, flight ticket, and private accommodation provided.',
        requirements: [
            'Valid Ethiopian Passport with 2+ years validity',
            'Mandatory pre-departure labor agency training certificate (COC)',
            'GAMCA / E-health medical clearance certificate',
            'Clean criminal record clearance certificate',
        ],
        agency: {
            name: 'Ethio-Gulf Overseas Recruitment Agency',
            phone: '+251911223344',
            whatsapp: '251911223344',
            telegram: 'EthioGulfRecruitment',
        },
    };

    const handleSubmitApplication = () => {
        Alert.alert('Application Submitted!', 'Your application has been received by the agency. They will review your profile and contact you shortly.');
        setApplyModalVisible(false);
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Top Header */}
            <View className="flex-row items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-slate-100">
                    <ArrowLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Job Vacancy</Text>
                <TouchableOpacity onPress={() => setIsSaved(!isSaved)} className="p-2 rounded-full bg-slate-100">
                    <Heart size={20} color={isSaved ? '#EF4444' : '#64748B'} fill={isSaved ? '#EF4444' : 'none'} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4 space-y-4">
                {/* Main Job Card */}
                <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            <Text className="text-xs font-bold text-blue-700">{vacancy.category.name}</Text>
                        </View>
                        <Text className="text-xs text-slate-400 font-medium">Ref #{vacancy.id}</Text>
                    </View>
                    <Text className="text-xl font-bold text-slate-900 mb-1">{vacancy.title}</Text>
                    <View className="flex-row items-center mb-4">
                        <MapPin size={16} color="#10B981" />
                        <Text className="text-sm font-semibold text-emerald-600 ml-1">{vacancy.country} ({vacancy.city})</Text>
                    </View>

                    <View className="bg-slate-50 p-4 rounded-xl flex-row items-center justify-between border border-slate-100">
                        <View>
                            <Text className="text-xs text-slate-400 font-medium">Monthly Salary</Text>
                            <Text className="text-xl font-extrabold text-emerald-600">${vacancy.salaryMin} - ${vacancy.salaryMax} {vacancy.salaryCurrency}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-xs text-slate-400 font-medium">Contract</Text>
                            <Text className="text-sm font-bold text-slate-800">{vacancy.contractPeriodYears} Years</Text>
                        </View>
                    </View>
                </View>

                {/* Included Benefits Grid */}
                <View className="bg-white p-5 rounded-2xl border border-slate-200">
                    <Text className="text-sm font-bold text-slate-900 mb-3">Provided Package & Benefits</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {vacancy.visaSponsorship && (
                            <View className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex-row items-center">
                                <CheckCircle2 size={16} color="#10B981" />
                                <Text className="text-xs font-bold text-emerald-800 ml-1.5">Visa Sponsorship</Text>
                            </View>
                        )}
                        {vacancy.accommodationProvided && (
                            <View className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex-row items-center">
                                <CheckCircle2 size={16} color="#10B981" />
                                <Text className="text-xs font-bold text-emerald-800 ml-1.5">Free Accommodation</Text>
                            </View>
                        )}
                        {vacancy.mealsProvided && (
                            <View className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex-row items-center">
                                <CheckCircle2 size={16} color="#10B981" />
                                <Text className="text-xs font-bold text-emerald-800 ml-1.5">Full Meals Included</Text>
                            </View>
                        )}
                        {vacancy.healthInsurance && (
                            <View className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 flex-row items-center">
                                <CheckCircle2 size={16} color="#10B981" />
                                <Text className="text-xs font-bold text-emerald-800 ml-1.5">Medical Insurance</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Job Description */}
                <View className="bg-white p-5 rounded-2xl border border-slate-200">
                    <Text className="text-sm font-bold text-slate-900 mb-2">Job Description</Text>
                    <Text className="text-slate-600 text-sm leading-relaxed">{vacancy.description}</Text>
                </View>

                {/* Mandatory Requirements */}
                <View className="bg-white p-5 rounded-2xl border border-slate-200 mb-8">
                    <Text className="text-sm font-bold text-slate-900 mb-3">Requirements & Clearances</Text>
                    {vacancy.requirements.map((req, idx) => (
                        <View key={idx} className="flex-row items-start mb-2.5">
                            <ShieldCheck size={16} color="#3B82F6" className="mt-0.5 mr-2" />
                            <Text className="text-xs text-slate-700 font-medium flex-1">{req}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Apply CTA Button */}
            <View className="p-4 bg-white border-t border-slate-200">
                <TouchableOpacity onPress={() => setApplyModalVisible(true)} className="bg-emerald-500 py-3.5 rounded-xl flex-row justify-center items-center">
                    <Send size={18} color="#FFFFFF" />
                    <Text className="text-white font-bold text-sm ml-2">Apply for Vacancy</Text>
                </TouchableOpacity>
            </View>

            {/* Application Form Modal */}
            <Modal visible={applyModalVisible} animationType="slide" transparent={true}>
                <View className="flex-1 justify-end bg-black/60">
                    <View className="bg-white p-6 rounded-t-3xl border-t border-slate-200">
                        <Text className="text-lg font-bold text-slate-900 mb-1">Apply for {vacancy.title}</Text>
                        <Text className="text-xs text-slate-500 mb-4">Your verified job seeker profile will be submitted to {vacancy.agency.name}.</Text>

                        <Text className="text-xs font-semibold text-slate-700 mb-1">Cover Letter / Introduction (Optional)</Text>
                        <TextInput
                            multiline
                            numberOfLines={3}
                            value={coverLetter}
                            onChangeText={setCoverLetter}
                            placeholder="Briefly explain your relevant experience..."
                            className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm text-slate-900 mb-4"
                        />

                        <View className="flex-row space-x-3">
                            <TouchableOpacity onPress={() => setApplyModalVisible(false)} className="flex-1 bg-slate-100 py-3.5 rounded-xl items-center">
                                <Text className="text-slate-700 font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmitApplication} className="flex-1 bg-emerald-500 py-3.5 rounded-xl items-center">
                                <Text className="text-white font-bold text-sm">Submit Application</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

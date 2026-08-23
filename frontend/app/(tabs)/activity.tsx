import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Users,
    Briefcase,
    Send,
    Eye,
    MessageSquare,
    CalendarDays,
    Award,
    ArrowRight,
    Inbox,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { PremiumHeader } from '../../components/PremiumHeader';
import { activityService, Application, Inquiry } from '../../services/activityService';

// ─── Status Config ─────────────────────────────────────────────

const applicationStatusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    APPLIED: { label: 'Applied', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: Send },
    UNDER_REVIEW: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: Eye },
    SHORTLISTED: { label: 'Shortlisted', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', icon: Award },
    INTERVIEW: { label: 'Interview', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', icon: CalendarDays },
    SELECTED: { label: 'Selected', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: XCircle },
};

const inquiryStatusConfig: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
    SENT: { label: 'Sent', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', icon: Send },
    VIEWED: { label: 'Viewed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: Eye },
    RESPONDED: { label: 'Responded', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: MessageSquare },
    INTERVIEW_SCHEDULED: { label: 'Interview Set', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200', icon: CalendarDays },
    HIRED: { label: 'Hired', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: CheckCircle2 },
    DECLINED: { label: 'Declined', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: XCircle },
};

// ─── Main Component ────────────────────────────────────────────

export default function ActivityScreen() {
    const { activeWorkspace } = useAuth();
    const { openChatWithAgency } = useChat();
    const isEmployer = activeWorkspace?.type === 'GULF_EMPLOYER';

    const [applications, setApplications] = useState<Application[]>([]);
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const loadData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            if (isEmployer) {
                const data = await activityService.getEmployerInquiries();
                setInquiries(data);
            } else {
                const data = await activityService.getUserApplications();
                setApplications(data);
            }
        } catch {
            // Fallback handled by service
        }
        setLoading(false);
    }, [isEmployer]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(false);
        setRefreshing(false);
    };

    // ─── Filter Logic ──────────────────────────────────────────

    const applicationFilters = ['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];
    const inquiryFilters = ['ALL', 'SENT', 'VIEWED', 'RESPONDED', 'INTERVIEW_SCHEDULED', 'HIRED'];

    const filteredApplications = activeFilter === 'ALL'
        ? applications
        : applications.filter(a => a.status === activeFilter);

    const filteredInquiries = activeFilter === 'ALL'
        ? inquiries
        : inquiries.filter(i => i.status === activeFilter);

    const filters = isEmployer ? inquiryFilters : applicationFilters;
    const statusConfig = isEmployer ? inquiryStatusConfig : applicationStatusConfig;

    // ─── Theme ─────────────────────────────────────────────────

    const isDark = activeWorkspace?.type && activeWorkspace.type !== 'PERSONAL';
    const headerBg = isEmployer ? 'bg-amber-950' : 'bg-white';
    const cardBg = isDark ? 'bg-slate-800' : 'bg-white';
    const cardBorder = isDark ? 'border-slate-700' : 'border-slate-200';
    const titleColor = isDark ? 'text-white' : 'text-slate-900';
    const subtitleColor = isDark ? 'text-slate-300' : 'text-slate-600';
    const bodyBg = isDark ? 'bg-slate-900' : 'bg-slate-50';
    const accentColor = isEmployer ? '#D97706' : '#059669';

    // ─── Render ────────────────────────────────────────────────

    return (
        <View className={`flex-1 ${bodyBg}`}>
            <PremiumHeader
                subtitle={isEmployer ? 'Candidate Inquiries & Responses' : 'Your Job Applications & Status'}
            />

            {/* Section Title */}
            <View className="px-5 pt-4 pb-2">
                <View className="flex-row items-center gap-2">
                    {isEmployer ? (
                        <Inbox size={18} color={accentColor} />
                    ) : (
                        <FileText size={18} color={accentColor} />
                    )}
                    <Text className={`text-base font-black ${titleColor}`}>
                        {isEmployer ? 'My Inquiries' : 'My Applications'}
                    </Text>
                    <View className="bg-slate-200 px-2 py-0.5 rounded-full">
                        <Text className="text-slate-700 text-[10px] font-extrabold">
                            {isEmployer ? inquiries.length : applications.length}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Status Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-5 pb-3"
                contentContainerStyle={{ gap: 8 }}
            >
                {filters.map((filter) => {
                    const isActive = activeFilter === filter;
                    const conf = statusConfig[filter];
                    return (
                        <Pressable
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            className={`px-3.5 py-1.5 rounded-full border ${isActive
                                ? (isDark ? 'bg-amber-500 border-amber-600' : 'bg-emerald-600 border-emerald-700')
                                : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')
                                }`}
                        >
                            <Text
                                className={`text-[11px] font-extrabold ${isActive
                                    ? (isDark ? 'text-slate-950' : 'text-white')
                                    : (isDark ? 'text-slate-300' : 'text-slate-700')
                                    }`}
                            >
                                {filter === 'ALL' ? 'All' : (conf?.label || filter)}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* Main Content */}
            {loading ? (
                <ActivityIndicator color={accentColor} size="large" className="mt-10" />
            ) : (
                <ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
                    }
                >
                    {/* ─── Job Seeker: Applications ─── */}
                    {!isEmployer && (
                        <>
                            {filteredApplications.length === 0 ? (
                                <View className={`${cardBg} p-8 rounded-2xl border ${cardBorder} items-center justify-center mt-2`}>
                                    <FileText size={36} color="#94A3B8" />
                                    <Text className={`${titleColor} text-sm font-bold mt-3`}>
                                        No Applications Yet
                                    </Text>
                                    <Text className={`${subtitleColor} text-xs text-center mt-1.5 leading-5`}>
                                        Browse jobs and apply to start tracking your applications here.
                                    </Text>
                                </View>
                            ) : (
                                filteredApplications.map((app) => {
                                    const conf = applicationStatusConfig[app.status] || applicationStatusConfig.APPLIED;
                                    const StatusIcon = conf.icon;
                                    return (
                                        <View
                                            key={app.id}
                                            className={`${cardBg} border ${cardBorder} rounded-2xl p-4 mb-3 shadow-sm`}
                                        >
                                            {/* Header Row */}
                                            <View className="flex-row items-start justify-between pb-3 border-b border-slate-100">
                                                <View className="flex-1 mr-3">
                                                    <View className="flex-row items-center gap-2 mb-1">
                                                        <Text className="text-base">{app.country_flag}</Text>
                                                        <Text className={`${titleColor} text-sm font-extrabold flex-1`} numberOfLines={1}>
                                                            {app.vacancy_title}
                                                        </Text>
                                                    </View>
                                                    <Text className={`${subtitleColor} text-xs font-semibold`}>
                                                        {app.agency_name}
                                                    </Text>
                                                </View>
                                                <View className={`px-2.5 py-1 rounded-full border ${conf.bg} ${conf.border} flex-row items-center gap-1`}>
                                                    <StatusIcon size={10} color={conf.text.replace('text-', '').includes('emerald') ? '#065F46' : conf.text.replace('text-', '').includes('amber') ? '#92400E' : conf.text.replace('text-', '').includes('blue') ? '#1E40AF' : conf.text.replace('text-', '').includes('purple') ? '#5B21B6' : conf.text.replace('text-', '').includes('indigo') ? '#3730A3' : '#991B1B'} />
                                                    <Text className={`text-[10px] font-black ${conf.text}`}>
                                                        {conf.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Details Row */}
                                            <View className="flex-row items-center justify-between mt-3">
                                                <View className="flex-row items-center gap-3">
                                                    <View className="bg-slate-100 px-2 py-0.5 rounded-md">
                                                        <Text className="text-slate-600 text-[10px] font-bold">
                                                            {app.salary_range}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-row items-center gap-1">
                                                        <Clock size={10} color="#94A3B8" />
                                                        <Text className="text-slate-400 text-[10px] font-semibold">
                                                            {app.applied_at}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Notes */}
                                            {app.notes && (
                                                <View className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-3">
                                                    <Text className="text-slate-600 text-xs font-medium leading-5">
                                                        {app.notes}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </>
                    )}

                    {/* ─── Employer: Inquiries ─── */}
                    {isEmployer && (
                        <>
                            {filteredInquiries.length === 0 ? (
                                <View className={`${cardBg} p-8 rounded-2xl border ${cardBorder} items-center justify-center mt-2`}>
                                    <Inbox size={36} color="#94A3B8" />
                                    <Text className={`${titleColor} text-sm font-bold mt-3`}>
                                        No Inquiries Yet
                                    </Text>
                                    <Text className={`${subtitleColor} text-xs text-center mt-1.5 leading-5`}>
                                        Browse candidates and send inquiries to agencies to start tracking them here.
                                    </Text>
                                </View>
                            ) : (
                                filteredInquiries.map((inq) => {
                                    const conf = inquiryStatusConfig[inq.status] || inquiryStatusConfig.SENT;
                                    const StatusIcon = conf.icon;
                                    return (
                                        <View
                                            key={inq.id}
                                            className={`${cardBg} border ${cardBorder} rounded-2xl p-4 mb-3 shadow-sm`}
                                        >
                                            {/* Header Row */}
                                            <View className="flex-row items-start justify-between pb-3 border-b border-slate-100">
                                                <View className="flex-1 mr-3">
                                                    <View className="flex-row items-center gap-2 mb-1">
                                                        <View className="bg-slate-900 px-1.5 py-0.5 rounded-md">
                                                            <Text className="text-amber-400 text-[9px] font-black">{inq.candidate_code}</Text>
                                                        </View>
                                                        <Text className={`${titleColor} text-sm font-extrabold flex-1`} numberOfLines={1}>
                                                            {inq.candidate_name}
                                                        </Text>
                                                    </View>
                                                    <Text className={`${subtitleColor} text-xs font-semibold`}>
                                                        {inq.skill_category} • via {inq.agency_name}
                                                    </Text>
                                                </View>
                                                <View className={`px-2.5 py-1 rounded-full border ${conf.bg} ${conf.border} flex-row items-center gap-1`}>
                                                    <StatusIcon size={10} color={conf.text.replace('text-', '').includes('emerald') ? '#065F46' : conf.text.replace('text-', '').includes('amber') ? '#92400E' : conf.text.replace('text-', '').includes('blue') ? '#1E40AF' : '#991B1B'} />
                                                    <Text className={`text-[10px] font-black ${conf.text}`}>
                                                        {conf.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Details Row */}
                                            <View className="flex-row items-center justify-between mt-3">
                                                <View className="flex-row items-center gap-1">
                                                    <Clock size={10} color="#94A3B8" />
                                                    <Text className="text-slate-400 text-[10px] font-semibold">
                                                        Sent {inq.sent_at}
                                                    </Text>
                                                </View>
                                                <Pressable
                                                    onPress={() => openChatWithAgency?.('agency-1', 'Agency Support')}
                                                    className="bg-amber-500 px-3 py-1.5 rounded-xl flex-row items-center gap-1 active:bg-amber-600"
                                                >
                                                    <MessageSquare size={12} color="#0F172A" />
                                                    <Text className="text-slate-950 text-[10px] font-black">Message</Text>
                                                </Pressable>
                                            </View>

                                            {/* Notes */}
                                            {inq.notes && (
                                                <View className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-3">
                                                    <Text className="text-amber-900 text-xs font-medium leading-5">
                                                        {inq.notes}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </>
                    )}

                    {/* Bottom Spacing */}
                    <View className="h-6" />
                </ScrollView>
            )}
        </View>
    );
}

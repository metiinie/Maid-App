import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Briefcase, User, FileText, Inbox, Building2, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabsLayout() {
    const { activeWorkspace } = useAuth();
    const type = activeWorkspace?.type || 'PERSONAL';

    const getActiveColor = () => {
        switch (type) {
            case 'AGENCY':
                return '#0284C7';
            case 'GULF_EMPLOYER':
                return '#D97706';
            case 'PLATFORM_ADMIN':
                return '#7C3AED';
            default:
                return '#059669';
        }
    };

    const activeColor = getActiveColor();
    const isJobSeeker = type === 'PERSONAL';
    const isEmployer = type === 'GULF_EMPLOYER';

    const getTabTitles = () => {
        switch (type) {
            case 'GULF_EMPLOYER':
                return {
                    home: 'Home',
                    browse: 'Browse Candidates',
                    activity: 'Inquiries',
                    profile: 'Profile',
                };
            case 'AGENCY':
                return {
                    home: 'Agency Hub',
                    browse: 'Roster',
                    activity: 'Pipeline',
                    profile: 'Profile',
                };
            case 'PLATFORM_ADMIN':
                return {
                    home: 'Control Center',
                    browse: 'Candidates',
                    activity: 'Vacancies',
                    profile: 'Profile',
                };
            default:
                return {
                    home: 'Home',
                    browse: 'Browse Jobs',
                    activity: 'My Applications',
                    profile: 'Profile',
                };
        }
    };

    const titles = getTabTitles();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    backgroundColor: '#0F172A',
                    borderTopColor: '#1E293B',
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                    elevation: 10,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: -3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '800',
                },
            }}
        >
            {/* Tab 1: Home — always visible */}
            <Tabs.Screen
                name="index"
                options={{
                    title: titles.home,
                    tabBarIcon: ({ color, size }) => (
                        type === 'AGENCY' ? <Building2 size={size} color={color} /> :
                            type === 'GULF_EMPLOYER' ? <Building2 size={size} color={color} /> :
                                type === 'PLATFORM_ADMIN' ? <ShieldCheck size={size} color={color} /> :
                                    <Home size={size} color={color} />
                    ),
                }}
            />

            {/* Tab 2a: Browse Jobs — shown for Job Seekers only */}
            <Tabs.Screen
                name="vacancies"
                options={{
                    title: titles.browse,
                    href: isJobSeeker ? undefined : null,
                    tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
                }}
            />

            {/* Tab 2b: Browse Candidates — shown for Employers/Agencies only */}
            <Tabs.Screen
                name="candidates"
                options={{
                    title: titles.browse,
                    href: isJobSeeker ? null : undefined,
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />

            {/* Tab 3: Activity — My Applications (seeker) / Inquiries (employer) */}
            <Tabs.Screen
                name="activity"
                options={{
                    title: titles.activity,
                    tabBarIcon: ({ color, size }) => (
                        isEmployer ? <Inbox size={size} color={color} /> :
                            <FileText size={size} color={color} />
                    ),
                }}
            />

            {/* Tab 4: Profile — always visible */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: titles.profile,
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />

            {/* ─── Hidden screens (still navigable, just not in tab bar) ─── */}
            <Tabs.Screen name="saved" options={{ href: null }} />
            <Tabs.Screen name="agencies" options={{ href: null }} />
            <Tabs.Screen name="messages" options={{ href: null }} />
            <Tabs.Screen name="notifications" options={{ href: null }} />
        </Tabs>
    );
}

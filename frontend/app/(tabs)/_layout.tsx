import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Briefcase, Bookmark, MessageSquare, Bell, GitPullRequest, Building2, ShieldCheck, User } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabsLayout() {
    const { activeWorkspace } = useAuth();
    const type = activeWorkspace?.type || 'PERSONAL';

    const getActiveColor = () => {
        switch (type) {
            case 'AGENCY':
                return '#0284C7'; // Deep Sky Blue
            case 'GULF_EMPLOYER':
                return '#D97706'; // Amber Gold
            case 'PLATFORM_ADMIN':
                return '#7C3AED'; // Purple Governance
            default:
                return '#059669'; // Emerald Green for Job Seekers
        }
    };

    const activeColor = getActiveColor();

    const getTabTitles = () => {
        switch (type) {
            case 'AGENCY':
                return {
                    home: 'Agency Hub',
                    candidates: 'Roster',
                    vacancies: 'Orders',
                    agencies: 'Partners',
                    saved: 'Pipeline',
                    messages: 'Messages',
                    alerts: 'Alerts',
                    profile: 'Profile',
                };
            case 'GULF_EMPLOYER':
                return {
                    home: 'Employer Hub',
                    candidates: 'Talent Search',
                    vacancies: 'My Requests',
                    agencies: 'Agencies',
                    saved: 'Shortlist',
                    messages: 'Chat',
                    alerts: 'Alerts',
                    profile: 'Profile',
                };
            case 'PLATFORM_ADMIN':
                return {
                    home: 'Control Center',
                    candidates: 'Candidates',
                    vacancies: 'Vacancies',
                    agencies: 'Agencies',
                    saved: 'Agencies',
                    messages: 'Support',
                    alerts: 'Audits',
                    profile: 'Profile',
                };
            default:
                return {
                    home: 'Home',
                    candidates: 'Talent Pool',
                    vacancies: 'Find Jobs',
                    agencies: 'Agencies',
                    saved: 'Saved',
                    messages: 'Messages',
                    alerts: 'Alerts',
                    profile: 'Profile',
                };
        }
    };

    const titles = getTabTitles();
    const isJobSeeker = type === 'PERSONAL';

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
            <Tabs.Screen
                name="vacancies"
                options={{
                    title: titles.vacancies,
                    tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="agencies"
                options={{
                    title: titles.agencies,
                    href: isJobSeeker || type === 'GULF_EMPLOYER' ? undefined : null,
                    tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="candidates"
                options={{
                    title: titles.candidates,
                    href: isJobSeeker ? null : undefined, // Hide for Job Seekers, show for Employers/Agencies
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: titles.saved,
                    tabBarIcon: ({ color, size }) => (
                        type === 'AGENCY' ? <GitPullRequest size={size} color={color} /> :
                            <Bookmark size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: titles.messages,
                    tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: titles.alerts,
                    tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: titles.profile,
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}



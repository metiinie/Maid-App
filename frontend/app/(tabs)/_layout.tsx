import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Briefcase, Bookmark, MessageSquare, Bell } from 'lucide-react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#059669',   // Emerald Green active
                tabBarInactiveTintColor: '#64748B', // Muted Slate
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',       // Crisp White
                    borderTopColor: '#E2E8F0',
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                    elevation: 8,
                    shadowColor: '#0F172A',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="candidates"
                options={{
                    title: 'Candidates',
                    tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="vacancies"
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ color, size }) => <Briefcase size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="messages"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

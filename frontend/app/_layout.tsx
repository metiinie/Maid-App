import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';
import { ChatProvider } from '../context/ChatContext';
import { ChatModal } from '../components/ChatModal';
import '../global.css';

export default function RootLayout() {
    return (
        <AuthProvider>
            <ChatProvider>
                <StatusBar style="dark" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#F8FAFC' },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="(auth)/register" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="(admin)/login" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="(user)/dashboard" />
                    <Stack.Screen name="(admin)/dashboard" />
                </Stack>
                <ChatModal />
            </ChatProvider>
        </AuthProvider>
    );
}


import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '../store/auth.store';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function useNotifications() {
    const { isAuthenticated, token } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        async function registerForPush() {
            if (!Device.isDevice) return;

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') return;

            try {
                const tokenData = await Notifications.getExpoPushTokenAsync();
                await axios.post(
                    `${API_URL}/users/me/device-tokens`,
                    {
                        token: tokenData.data,
                        platform: Platform.OS,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
            } catch (error) {
                console.error('Failed to register Expo push token:', error);
            }
        }

        registerForPush();
    }, [isAuthenticated, token]);
}

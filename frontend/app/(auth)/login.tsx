import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Phone, Lock, Mail, ArrowRight, User, Building2 } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const [phone, setPhone] = useState('+251911223344');
    const [password, setPassword] = useState('Password123!');
    const [loading, setLoading] = useState(false);

    const { loginUser } = useAuth();
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await loginUser(phone, password);
            Alert.alert('Welcome!', 'Logged in successfully.');
            router.replace('/(auth)/mode-select');
        } catch (err: any) {
            Alert.alert('Login Failed', err.message || 'Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-5 py-10">
                <View className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
                    {/* Header */}
                    <View className="items-center mb-6">
                        <View className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 items-center justify-center mb-3">
                            <ShieldCheck size={28} color="#D97706" strokeWidth={2.5} />
                        </View>
                        <Text className="text-slate-900 text-xl font-extrabold text-center">
                            Sign In to Account
                        </Text>
                        <Text className="text-slate-600 text-xs mt-1 text-center font-medium">
                            Access recruitment portal as Employer or Job Seeker
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View className="mb-3">
                        <Text className="text-slate-900 text-xs font-bold mb-1.5">Phone Number</Text>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5">
                            <Phone size={16} color="#D97706" />
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+251 911 000000"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-slate-900 text-xs font-bold mb-1.5">Password / PIN</Text>
                        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5">
                            <Lock size={16} color="#64748B" />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••••••"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry
                                className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:bg-amber-600 shadow-xs"
                    >
                        <Text className="text-slate-950 text-xs font-extrabold uppercase">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Text>
                        <ArrowRight size={14} color="#0F172A" />
                    </Pressable>

                    {/* Register Link */}
                    <Pressable onPress={() => router.push('/(auth)/register')} className="mt-4 items-center">
                        <Text className="text-slate-600 text-xs font-medium">
                            Don't have an account?{' '}
                            <Text className="text-amber-600 font-bold">Register Now</Text>
                        </Text>
                    </Pressable>

                    {/* Back */}
                    <Pressable onPress={() => router.replace('/(tabs)')} className="mt-3 items-center">
                        <Text className="text-slate-500 text-xs font-medium">← Back to Main App</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Phone, Lock, Mail, ArrowRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [phone, setPhone] = useState('+251911223344');
    const [email, setEmail] = useState('admin@ethiodubai.et');
    const [password, setPassword] = useState('Password123!');
    const [loading, setLoading] = useState(false);

    const { loginUser, loginAdmin } = useAuth();
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isAdminMode) {
                await loginAdmin(email, password);
                router.replace('/(admin)/dashboard');
            } else {
                await loginUser(phone, password);
                router.replace('/(user)/dashboard');
            }
        } catch (err: any) {
            Alert.alert('Login Failed', err.message || 'Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-ethiopia-navy" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-6 py-10">
                <View className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
                    {/* Header */}
                    <View className="items-center mb-6">
                        <View className="w-14 h-14 rounded-2xl bg-ethiopia-gold items-center justify-center mb-3">
                            <ShieldCheck size={28} color="#0A192F" strokeWidth={2.5} />
                        </View>
                        <Text className="text-white text-xl font-extrabold text-center">
                            {isAdminMode ? 'Agency Admin Login' : 'Sign In to EthioRecruit'}
                        </Text>
                        <Text className="text-slate-400 text-[11px] mt-1 text-center">
                            {isAdminMode ? 'Access your recruitment SaaS control panel' : 'Manage applications & deployment tracking'}
                        </Text>
                    </View>

                    {/* Mode Toggle */}
                    <View className="flex-row bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
                        <Pressable
                            onPress={() => setIsAdminMode(false)}
                            className={`flex-1 py-2.5 rounded-lg items-center ${!isAdminMode ? 'bg-ethiopia-gold' : ''}`}
                        >
                            <Text className={`text-[11px] font-bold ${!isAdminMode ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                                User Portal
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setIsAdminMode(true)}
                            className={`flex-1 py-2.5 rounded-lg items-center ${isAdminMode ? 'bg-ethiopia-gold' : ''}`}
                        >
                            <Text className={`text-[11px] font-bold ${isAdminMode ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                                Agency Admin
                            </Text>
                        </Pressable>
                    </View>

                    {/* Form Fields */}
                    {!isAdminMode ? (
                        <View className="mb-3">
                            <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Phone Number</Text>
                            <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                                <Phone size={14} color="#64748B" />
                                <TextInput
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="+251 911 000000"
                                    placeholderTextColor="#64748B"
                                    keyboardType="phone-pad"
                                    className="flex-1 text-white text-xs ml-2.5 py-3"
                                />
                            </View>
                        </View>
                    ) : (
                        <View className="mb-3">
                            <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Admin Email</Text>
                            <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                                <Mail size={14} color="#64748B" />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="admin@agency.et"
                                    placeholderTextColor="#64748B"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="flex-1 text-white text-xs ml-2.5 py-3"
                                />
                            </View>
                        </View>
                    )}

                    <View className="mb-5">
                        <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Password</Text>
                        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-3">
                            <Lock size={14} color="#64748B" />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••••••"
                                placeholderTextColor="#64748B"
                                secureTextEntry
                                className="flex-1 text-white text-xs ml-2.5 py-3"
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <Pressable
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-ethiopia-gold py-3.5 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
                    >
                        <Text className="text-ethiopia-navy text-xs font-extrabold">
                            {loading ? 'Authenticating...' : 'Sign In Now'}
                        </Text>
                        <ArrowRight size={14} color="#0A192F" />
                    </Pressable>

                    {/* Register Link */}
                    <Pressable onPress={() => router.push('/(auth)/register')} className="mt-4 items-center">
                        <Text className="text-slate-400 text-xs">
                            Don't have an account?{' '}
                            <Text className="text-ethiopia-gold font-bold">Register</Text>
                        </Text>
                    </Pressable>

                    {/* Back */}
                    <Pressable onPress={() => router.back()} className="mt-3 items-center">
                        <Text className="text-slate-500 text-[11px]">← Back to Home</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

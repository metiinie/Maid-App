import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Phone, Lock, Mail, ArrowRight, User, Building2 } from 'lucide-react-native';
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
                Alert.alert('Welcome Admin!', 'Logged in successfully as Agency Admin.');
                router.replace('/(admin)/dashboard');
            } else {
                await loginUser(phone, password);
                Alert.alert('Welcome!', 'Logged in successfully.');
                router.replace('/(auth)/mode-select');
            }
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
                        <View className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 items-center justify-center mb-3">
                            <ShieldCheck size={28} color="#1E3A8A" strokeWidth={2.5} />
                        </View>
                        <Text className="text-slate-900 text-xl font-extrabold text-center">
                            {isAdminMode ? 'Agency Admin Portal' : 'User / Candidate Sign In'}
                        </Text>
                        <Text className="text-slate-600 text-xs mt-1 text-center font-medium">
                            {isAdminMode ? 'Access recruitment SaaS dashboard & hiring pipeline' : 'Track your applications, medical, and visa progress'}
                        </Text>
                    </View>

                    {/* Role Mode Toggle */}
                    <View className="flex-row bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-6">
                        <Pressable
                            onPress={() => setIsAdminMode(false)}
                            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${!isAdminMode ? 'bg-emerald-600 shadow-xs' : ''
                                }`}
                        >
                            <User size={14} color={!isAdminMode ? '#FFFFFF' : '#64748B'} />
                            <Text className={`text-xs font-bold ${!isAdminMode ? 'text-white' : 'text-slate-700'}`}>
                                User / Candidate
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setIsAdminMode(true)}
                            className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 ${isAdminMode ? 'bg-blue-900 shadow-xs' : ''
                                }`}
                        >
                            <Building2 size={14} color={isAdminMode ? '#FFFFFF' : '#64748B'} />
                            <Text className={`text-xs font-bold ${isAdminMode ? 'text-white' : 'text-slate-700'}`}>
                                Agency Admin
                            </Text>
                        </Pressable>
                    </View>

                    {/* Form Fields */}
                    {!isAdminMode ? (
                        <View className="mb-3">
                            <Text className="text-slate-900 text-xs font-bold mb-1.5">Phone Number</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5">
                                <Phone size={16} color="#059669" />
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
                    ) : (
                        <View className="mb-3">
                            <Text className="text-slate-900 text-xs font-bold mb-1.5">Admin Email</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5">
                                <Mail size={16} color="#1E3A8A" />
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="admin@agency.et"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    className="flex-1 text-slate-900 text-xs ml-2.5 py-3 font-medium"
                                />
                            </View>
                        </View>
                    )}

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
                        className={`${isAdminMode ? 'bg-blue-900' : 'bg-emerald-600'} py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-90 shadow-xs`}
                    >
                        <Text className="text-white text-xs font-extrabold">
                            {loading ? 'Authenticating...' : isAdminMode ? 'Sign In as Agency Admin' : 'Sign In as Candidate'}
                        </Text>
                        <ArrowRight size={14} color="#FFFFFF" />
                    </Pressable>

                    {/* Preset Fill Buttons for Quick Testing */}
                    <View className="mt-5 pt-4 border-t border-slate-100 items-center">
                        <Text className="text-slate-500 text-[11px] font-bold mb-2">Quick Test Login Presets:</Text>
                        <View className="flex-row gap-2 w-full">
                            <Pressable
                                onPress={() => {
                                    setIsAdminMode(false);
                                    setPhone('+251911223344');
                                    setPassword('Password123!');
                                }}
                                className="flex-1 bg-emerald-50 border border-emerald-200 py-2 rounded-lg items-center"
                            >
                                <Text className="text-emerald-800 text-[10px] font-bold">Fill User Demo</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setIsAdminMode(true);
                                    setEmail('admin@ethiodubai.et');
                                    setPassword('Password123!');
                                }}
                                className="flex-1 bg-blue-50 border border-blue-200 py-2 rounded-lg items-center"
                            >
                                <Text className="text-blue-900 text-[10px] font-bold">Fill Admin Demo</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Register Link */}
                    <Pressable onPress={() => router.push('/(auth)/register')} className="mt-4 items-center">
                        <Text className="text-slate-600 text-xs font-medium">
                            Don't have an account?{' '}
                            <Text className="text-emerald-700 font-bold">Register Now</Text>
                        </Text>
                    </Pressable>

                    {/* Back */}
                    <Pressable onPress={() => router.replace('/')} className="mt-3 items-center">
                        <Text className="text-slate-500 text-xs font-medium">← Back to Public User Home</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

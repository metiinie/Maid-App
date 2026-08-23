import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Mail, Lock, ArrowRight, Key } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginScreen() {
    const [email, setEmail] = useState('admin@ethiodubai.et');
    const [password, setPassword] = useState('Password123!');
    const [loading, setLoading] = useState(false);

    const { loginAdmin } = useAuth();
    const router = useRouter();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await loginAdmin(email, password);
            Alert.alert('Welcome Admin!', 'Logged in successfully as Agency Admin.');
            router.replace('/(admin)/dashboard');
        } catch (err: any) {
            Alert.alert('Admin Login Failed', err.message || 'Please check seeded admin credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-slate-950" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View className="px-5 py-10">
                <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
                    {/* Header */}
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 items-center justify-center mb-3">
                            <ShieldCheck size={32} color="#F59E0B" strokeWidth={2.5} />
                        </View>
                        <Text className="text-white text-xl font-black text-center">
                            Agency Admin SaaS Portal
                        </Text>
                        <Text className="text-slate-400 text-xs mt-1 text-center font-medium">
                            Restricted Portal for Licensed Ethiopian Agency Management
                        </Text>
                    </View>

                    {/* Seeded Credentials Banner */}
                    <View className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mb-6 flex-row items-center gap-3">
                        <Key size={20} color="#F59E0B" />
                        <View className="flex-1">
                            <Text className="text-amber-400 text-xs font-black">Seeded Admin Credentials</Text>
                            <Text className="text-slate-300 text-[11px] font-mono mt-0.5">
                                admin@ethiodubai.et / Password123!
                            </Text>
                        </View>
                    </View>

                    {/* Form Fields */}
                    <View className="mb-4">
                        <Text className="text-slate-300 text-xs font-bold mb-1.5">Admin Email</Text>
                        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5">
                            <Mail size={16} color="#F59E0B" />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="admin@ethiodubai.et"
                                placeholderTextColor="#64748B"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="flex-1 text-white text-xs ml-2.5 py-3 font-medium"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-slate-300 text-xs font-bold mb-1.5">Admin Password</Text>
                        <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5">
                            <Lock size={16} color="#64748B" />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••••••"
                                placeholderTextColor="#64748B"
                                secureTextEntry
                                className="flex-1 text-white text-xs ml-2.5 py-3 font-medium"
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:bg-amber-600 shadow-md"
                    >
                        <Text className="text-slate-950 text-xs font-black uppercase tracking-wider">
                            {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
                        </Text>
                        <ArrowRight size={16} color="#0F172A" />
                    </Pressable>

                    {/* Return Link */}
                    <Pressable onPress={() => router.replace('/(tabs)')} className="mt-5 items-center">
                        <Text className="text-slate-400 text-xs font-medium">← Back to Main Recruitment App</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

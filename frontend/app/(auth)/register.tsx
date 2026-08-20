import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Phone, ArrowRight, CheckCircle } from 'lucide-react-native';
import { authService } from '../../services/authService';

export default function RegisterScreen() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('+251911998877');
    const [otpCode, setOtpCode] = useState('123456');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employer');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleRequestOtp = async () => {
        setLoading(true);
        try {
            await authService.requestOtp(phone, 'registration');
            setStep(2);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!firstName || !lastName || !password) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }
        setLoading(true);
        try {
            await authService.verifyOtp(phone, otpCode, 'registration');
            await authService.registerUser({
                phone,
                password,
                first_name: firstName,
                last_name: lastName,
                role,
            });
            Alert.alert('Success', 'Registration complete. Please sign in.', [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Registration failed.');
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
                        <Text className="text-white text-xl font-extrabold">Create Account</Text>
                        <Text className="text-slate-400 text-[11px] mt-1">
                            Step {step} of 2: {step === 1 ? 'Phone Verification' : 'Profile Setup'}
                        </Text>
                    </View>

                    {step === 1 ? (
                        <View>
                            <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Phone Number (SMS OTP)</Text>
                            <View className="flex-row items-center bg-slate-950 border border-slate-800 rounded-xl px-3 mb-5">
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
                            <Pressable
                                onPress={handleRequestOtp}
                                disabled={loading}
                                className="bg-ethiopia-gold py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
                            >
                                <Text className="text-ethiopia-navy text-xs font-extrabold">
                                    {loading ? 'Sending...' : 'Send Verification OTP'}
                                </Text>
                                <ArrowRight size={14} color="#0A192F" />
                            </Pressable>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">OTP Code</Text>
                            <TextInput
                                value={otpCode}
                                onChangeText={setOtpCode}
                                placeholder="123456"
                                placeholderTextColor="#64748B"
                                keyboardType="number-pad"
                                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest mb-4"
                            />

                            <View className="flex-row gap-3 mb-3">
                                <View className="flex-1">
                                    <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">First Name *</Text>
                                    <TextInput
                                        value={firstName}
                                        onChangeText={setFirstName}
                                        placeholder="Almaz"
                                        placeholderTextColor="#64748B"
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Last Name *</Text>
                                    <TextInput
                                        value={lastName}
                                        onChangeText={setLastName}
                                        placeholder="Tesfaye"
                                        placeholderTextColor="#64748B"
                                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs"
                                    />
                                </View>
                            </View>

                            <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Account Role</Text>
                            <View className="flex-row bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
                                <Pressable
                                    onPress={() => setRole('employer')}
                                    className={`flex-1 py-2 rounded-lg items-center ${role === 'employer' ? 'bg-ethiopia-gold' : ''}`}
                                >
                                    <Text className={`text-[10px] font-bold ${role === 'employer' ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                                        Employer
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setRole('jobseeker')}
                                    className={`flex-1 py-2 rounded-lg items-center ${role === 'jobseeker' ? 'bg-ethiopia-gold' : ''}`}
                                >
                                    <Text className={`text-[10px] font-bold ${role === 'jobseeker' ? 'text-ethiopia-navy' : 'text-slate-400'}`}>
                                        Jobseeker
                                    </Text>
                                </Pressable>
                            </View>

                            <Text className="text-slate-300 text-[11px] font-semibold mb-1.5">Password *</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#64748B"
                                secureTextEntry
                                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs mb-5"
                            />

                            <Pressable
                                onPress={handleRegister}
                                disabled={loading}
                                className="bg-ethiopia-gold py-3.5 rounded-2xl items-center flex-row justify-center gap-2"
                            >
                                <Text className="text-ethiopia-navy text-xs font-extrabold">
                                    {loading ? 'Registering...' : 'Complete Registration'}
                                </Text>
                                <CheckCircle size={14} color="#0A192F" />
                            </Pressable>
                        </View>
                    )}

                    {/* Back to Login */}
                    <Pressable onPress={() => router.push('/(auth)/login')} className="mt-4 items-center">
                        <Text className="text-slate-400 text-xs">
                            Already registered? <Text className="text-ethiopia-gold font-bold">Sign in</Text>
                        </Text>
                    </Pressable>

                    <Pressable onPress={() => router.back()} className="mt-3 items-center">
                        <Text className="text-slate-500 text-[11px]">← Back</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

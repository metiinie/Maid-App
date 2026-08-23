import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { X, Send, CheckCircle2, User } from 'lucide-react-native';
import { CandidateProps } from './CandidateCard';

interface InquiryModalProps {
    visible: boolean;
    candidate: CandidateProps | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function InquiryModal({ visible, candidate, onClose, onSuccess }: InquiryModalProps) {
    const [name, setName] = useState('Omar Al-Rashid');
    const [phone, setPhone] = useState('+966 50 123 4567');
    const [location, setLocation] = useState('Riyadh, Saudi Arabia');
    const [message, setMessage] = useState(
        "I'm interested in hiring this candidate for domestic work in Riyadh. Start date flexible from next month."
    );

    const handleSend = () => {
        Alert.alert('Inquiry Sent', 'The agency will contact you within 24 hours.');
        onSuccess();
        onClose();
    };

    if (!candidate) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white rounded-t-3xl border-t border-slate-200 p-6 max-h-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
                        <View>
                            <Text className="text-slate-900 text-lg font-black">Send Inquiry to Agency</Text>
                            <Text className="text-slate-500 text-xs font-semibold mt-0.5">
                                Verified recruitment agency communication
                            </Text>
                        </View>
                        <Pressable onPress={onClose} className="p-2 rounded-full bg-slate-100">
                            <X size={18} color="#64748B" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                        {/* Target Candidate Summary Card */}
                        <View className="bg-slate-900 rounded-2xl p-4 flex-row items-center mb-4">
                            <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center mr-3 border-2 border-white">
                                <Text className="text-slate-950 font-black text-lg">
                                    {candidate.first_name?.[0]}{candidate.last_name?.[0]}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-extrabold text-sm">
                                    {candidate.first_name} {candidate.last_name}
                                </Text>
                                <Text className="text-amber-400 text-xs font-semibold mt-0.5">
                                    {candidate.role} • GAMCA Medical Cleared
                                </Text>
                            </View>
                        </View>

                        {/* Form Inputs */}
                        <View className="mb-3">
                            <Text className="text-slate-700 text-xs font-bold mb-1.5">Your Full Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                            />
                        </View>

                        <View className="mb-3">
                            <Text className="text-slate-700 text-xs font-bold mb-1.5">Contact Number (WhatsApp)</Text>
                            <TextInput
                                value={phone}
                                onChangeText={setPhone}
                                className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                            />
                        </View>

                        <View className="mb-3">
                            <Text className="text-slate-700 text-xs font-bold mb-1.5">Location / City</Text>
                            <TextInput
                                value={location}
                                onChangeText={setLocation}
                                className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold"
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-700 text-xs font-bold mb-1.5">Message to Agency</Text>
                            <TextInput
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={3}
                                className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm font-semibold h-24"
                            />
                        </View>

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleSend}
                            className="bg-amber-500 py-4 rounded-full items-center flex-row justify-center gap-2 shadow-md active:bg-amber-600 mb-6"
                        >
                            <Send size={18} color="#0F172A" />
                            <Text className="text-slate-950 text-sm font-black uppercase">
                                Send Inquiry to Agency
                            </Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

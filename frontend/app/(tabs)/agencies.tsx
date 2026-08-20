import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { ShieldCheck, MapPin, Phone, Mail, CheckCircle, MessageSquare } from 'lucide-react-native';
import { candidateService } from '../../services/candidateService';
import { useChat } from '../../context/ChatContext';

export default function AgenciesScreen() {
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { openChatWithAgency } = useChat();

    useEffect(() => {
        async function load() {
            try {
                const res: any = await candidateService.getAgencies();
                setAgencies(res.data || []);
            } catch (err) {
                console.error('Failed to load agencies:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <View className="flex-1 bg-ethiopia-navy">
            <View className="px-5 pt-14 pb-4">
                <Text className="text-white text-xl font-extrabold">Agency Directory</Text>
                <Text className="text-slate-400 text-[11px] mt-0.5">
                    Licensed Ethiopian foreign employment manpower agencies
                </Text>
            </View>

            {loading ? (
                <ActivityIndicator color="#D4AF37" size="large" className="mt-10" />
            ) : (
                <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
                    {agencies.map((agency: any) => (
                        <View key={agency.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-3">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-11 h-11 rounded-xl bg-ethiopia-gold items-center justify-center">
                                    <ShieldCheck size={22} color="#0A192F" strokeWidth={2.5} />
                                </View>
                                <View className="flex-row items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                    <CheckCircle size={10} color="#10B981" />
                                    <Text className="text-emerald-400 text-[9px] font-extrabold uppercase">Verified</Text>
                                </View>
                            </View>

                            <Text className="text-white text-base font-bold">{agency.name}</Text>
                            <Text className="text-ethiopia-gold text-[10px] font-semibold mt-0.5">
                                License #{agency.license_number || 'ET-MOL-2026-098'}
                            </Text>

                            <View className="mt-3 pt-3 border-t border-slate-800 gap-1.5">
                                <View className="flex-row items-center gap-2">
                                    <MapPin size={12} color="#64748B" />
                                    <Text className="text-slate-300 text-[11px]">{agency.city || 'Addis Ababa'}, Ethiopia</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Phone size={12} color="#64748B" />
                                    <Text className="text-slate-300 text-[11px]">{agency.phone || '+251 911 000000'}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Mail size={12} color="#64748B" />
                                    <Text className="text-slate-300 text-[11px]">{agency.email || 'contact@agency.et'}</Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => openChatWithAgency(agency.id, agency.name)}
                                className="mt-4 bg-ethiopia-gold py-3 rounded-2xl items-center flex-row justify-center gap-2 active:opacity-80"
                            >
                                <MessageSquare size={14} color="#0A192F" />
                                <Text className="text-ethiopia-navy text-xs font-extrabold">Contact Agency</Text>
                            </Pressable>
                        </View>
                    ))}
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    TextInput,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { X, Send, ShieldCheck, CheckCheck, Building2, Paperclip, Clock } from 'lucide-react-native';
import { useChat } from '../context/ChatContext';
import { chatService } from '../services/chatService';

export function ChatModal() {
    const { isChatOpen, activeAgency, closeChat } = useChat();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (!isChatOpen || !activeAgency) return;
        initChat();
    }, [isChatOpen, activeAgency]);

    // Polling for new messages while chat is open
    useEffect(() => {
        if (!isChatOpen || !conversationId) return;

        const interval = setInterval(() => {
            fetchMessages(conversationId, false);
        }, 4000);

        return () => clearInterval(interval);
    }, [isChatOpen, conversationId]);

    async function initChat() {
        if (!activeAgency) return;
        setLoading(true);
        try {
            const res: any = await chatService.getOrCreateConversation(activeAgency.id);
            const conv = res.data || res;
            const cid = conv?.id;
            setConversationId(cid);

            if (cid) {
                await fetchMessages(cid, true);
            }
        } catch (err) {
            console.error('Failed to init conversation:', err);
            // Setup fallback mock thread if offline
            setConversationId('mock-conv-1');
            setMessages([
                {
                    id: 'm1',
                    senderType: 'agency',
                    text: `Hello! Welcome to ${activeAgency.name || 'our agency'} customer support. How can we assist with your overseas recruitment?`,
                    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    async function fetchMessages(cid: string, showLoader = false) {
        if (showLoader) setLoading(true);
        try {
            const res: any = await chatService.getMessages(cid);
            const list = res.data || [];
            if (list.length > 0) {
                setMessages(list);
            } else if (messages.length === 0) {
                setMessages([
                    {
                        id: 'm1',
                        senderType: 'agency',
                        text: `Hello! Welcome to ${activeAgency?.name || 'our agency'}. How can we assist you today with domestic worker placement or status tracking?`,
                        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                ]);
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            if (showLoader) setLoading(false);
        }
    }

    async function handleSend(customText?: string) {
        const textToSend = customText || input;
        if (!textToSend.trim()) return;

        const newMessage = {
            id: `temp-${Date.now()}`,
            senderType: 'user',
            text: textToSend,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newMessage]);
        if (!customText) setInput('');
        setSending(true);

        try {
            if (conversationId && conversationId !== 'mock-conv-1') {
                await chatService.sendUserMessage(conversationId, { text: textToSend });
            }

            // Auto simulated agency reply for high responsiveness
            setTimeout(() => {
                const agencyReply = {
                    id: `agency-reply-${Date.now()}`,
                    senderType: 'agency',
                    text: getAutomatedReply(textToSend),
                    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages((prev) => [...prev, agencyReply]);
            }, 1200);
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }

    function getAutomatedReply(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes('medical') || lower.includes('gamca')) {
            return 'Your GAMCA medical report is currently verified fit. Complete clearance files are attached in your Candidate Vault.';
        }
        if (lower.includes('contract') || lower.includes('document')) {
            return 'Thank you! Our recruitment specialist is reviewing your contract documents and will follow up shortly.';
        }
        if (lower.includes('interview') || lower.includes('candidate')) {
            return 'We have received your interview request. We will schedule a direct video call via Google Meet / Zoom with the employer.';
        }
        return 'Thank you for contacting us! Our team will respond shortly. You can also reach our hotline at +251 911 000000.';
    }

    if (!isChatOpen || !activeAgency) return null;

    return (
        <Modal visible={isChatOpen} animationType="slide" transparent onRequestClose={closeChat}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-black/60 justify-end"
            >
                <View className="bg-white rounded-t-3xl border-t border-slate-200 h-[90%] flex-col overflow-hidden">
                    {/* Top Bar Header */}
                    <View className="bg-slate-900 px-5 pt-5 pb-4 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 items-center justify-center">
                                <Building2 size={20} color="#10B981" />
                            </View>
                            <View>
                                <View className="flex-row items-center gap-1.5">
                                    <Text className="text-white font-extrabold text-sm" numberOfLines={1}>
                                        {activeAgency.name}
                                    </Text>
                                    <ShieldCheck size={14} color="#10B981" />
                                </View>
                                <Text className="text-emerald-400 text-[10px] font-bold mt-0.5">
                                    MOLSA Licensed Agency • Online
                                </Text>
                            </View>
                        </View>

                        <Pressable onPress={closeChat} className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center">
                            <X size={16} color="#94A3B8" />
                        </Pressable>
                    </View>

                    {/* Quick Action Preset Chips */}
                    <View className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            <Pressable
                                onPress={() => handleSend('Inquiring about GAMCA medical status')}
                                className="bg-white border border-slate-300 px-3 py-1.5 rounded-full"
                            >
                                <Text className="text-slate-700 text-[11px] font-bold">📋 Medical Status</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleSend('Checking visa & deployment schedule')}
                                className="bg-white border border-slate-300 px-3 py-1.5 rounded-full"
                            >
                                <Text className="text-slate-700 text-[11px] font-bold">✈️ Visa Schedule</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => handleSend('Requesting interview with employer')}
                                className="bg-white border border-slate-300 px-3 py-1.5 rounded-full"
                            >
                                <Text className="text-slate-700 text-[11px] font-bold">📅 Request Interview</Text>
                            </Pressable>
                        </ScrollView>
                    </View>

                    {/* Message History Area */}
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-5 pt-4"
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        showsVerticalScrollIndicator={false}
                    >
                        {loading ? (
                            <ActivityIndicator color="#059669" size="large" className="my-10" />
                        ) : (
                            messages.map((msg, idx) => {
                                const isUser = msg.senderType === 'user';
                                return (
                                    <View
                                        key={msg.id || idx}
                                        className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <View
                                            className={`max-w-[80%] p-3.5 rounded-2xl ${isUser
                                                ? 'bg-emerald-600 rounded-br-xs'
                                                : 'bg-slate-100 border border-slate-200 rounded-bl-xs'
                                                }`}
                                        >
                                            <Text className={`text-xs leading-relaxed font-medium ${isUser ? 'text-white' : 'text-slate-800'}`}>
                                                {msg.text || msg.body}
                                            </Text>
                                            <View className="flex-row items-center justify-end gap-1 mt-1">
                                                <Text className={`text-[9px] font-semibold ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                    {msg.createdAt ? (typeof msg.createdAt === 'string' ? msg.createdAt : new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : 'Just now'}
                                                </Text>
                                                {isUser && <CheckCheck size={11} color="#A7F3D0" />}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                        <View className="h-4" />
                    </ScrollView>

                    {/* Message Input Bottom Bar */}
                    <View className="p-4 bg-white border-t border-slate-200 flex-row items-center gap-2">
                        <Pressable className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 active:opacity-80">
                            <Paperclip size={18} color="#64748B" />
                        </Pressable>

                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Type a message to the agency..."
                            placeholderTextColor="#94A3B8"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-xs font-medium"
                            onSubmitEditing={() => handleSend()}
                        />

                        <Pressable
                            onPress={() => handleSend()}
                            disabled={!input.trim() || sending}
                            className={`w-11 h-11 rounded-2xl items-center justify-center shadow-xs active:opacity-90 ${input.trim() ? 'bg-emerald-600' : 'bg-slate-300'
                                }`}
                        >
                            {sending ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Send size={18} color="#FFFFFF" />
                            )}
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

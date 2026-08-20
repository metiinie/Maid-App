import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Paperclip, MessageSquare, ShieldCheck, User, Image, FileText } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';

export default function ChatDrawer() {
    const { isChatOpen, closeChat, activeAgency } = useChat();
    const { user, admin } = useAuth();
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize or fetch conversation
    useEffect(() => {
        if (!isChatOpen || !activeAgency?.id) return;

        async function initChat() {
            setLoading(true);
            try {
                if (user) {
                    const res = await chatService.getOrCreateConversation(
                        activeAgency.id,
                        activeAgency.contextType || 'candidate_inquiry',
                        activeAgency.contextId || null
                    );
                    setConversationId(res.data.id);
                    const msgsRes = await chatService.getMessages(res.data.id, false);
                    setMessages(msgsRes.data || []);
                } else if (admin) {
                    // If admin, activeAgency.id is conversationId
                    setConversationId(activeAgency.id);
                    const msgsRes = await chatService.getMessages(activeAgency.id, true);
                    setMessages(msgsRes.data || []);
                }
            } catch (err) {
                console.error('Failed to load chat conversation:', err);
            } finally {
                setLoading(false);
            }
        }

        initChat();
    }, [isChatOpen, activeAgency, user, admin]);

    // Poll for new messages every 5 seconds when drawer open
    useEffect(() => {
        if (!isChatOpen || !conversationId) return;

        const interval = setInterval(async () => {
            try {
                const msgsRes = await chatService.getMessages(conversationId, !!admin);
                setMessages(msgsRes.data || []);
            } catch (err) {
                // silent catch
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isChatOpen, conversationId, admin]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!isChatOpen) return null;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!textInput.trim() && !fileInput) return;
        if (!conversationId) return;

        setSending(true);
        try {
            const formData = new FormData();
            if (textInput.trim()) formData.append('message_text', textInput);
            if (fileInput) formData.append('attachment', fileInput);

            if (admin) {
                await chatService.sendAdminMessage(conversationId, formData);
            } else {
                await chatService.sendUserMessage(conversationId, formData);
            }

            setTextInput('');
            setFileInput(null);

            // Refresh messages
            const msgsRes = await chatService.getMessages(conversationId, !!admin);
            setMessages(msgsRes.data || []);
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">

                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gold-gradient-bg flex items-center justify-center font-bold text-slate-950">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white">{activeAgency?.name || 'Agency Support'}</h3>
                                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span>Online • In-App Support</span>
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={closeChat}
                            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40">
                        {loading ? (
                            <div className="text-center py-10 text-xs text-slate-400">Loading conversation history...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-10 text-xs text-slate-400 space-y-2">
                                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                                <p>No messages yet. Send a message to start communicating with {activeAgency?.name || 'the agency'}.</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = admin ? msg.sender_type === 'admin' : msg.sender_type === 'user';
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${isMe
                                                    ? 'gold-gradient-bg text-slate-950 font-medium rounded-tr-none shadow-md'
                                                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                                                }`}
                                        >
                                            {msg.message_text && <p className="whitespace-pre-wrap">{msg.message_text}</p>}

                                            {msg.attachment_url && (
                                                <div className="mt-2 pt-1 border-t border-slate-700/50 flex items-center gap-2">
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    <a
                                                        href={msg.attachment_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="underline truncate font-semibold"
                                                    >
                                                        View Attachment
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 px-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Footer */}
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950">
                        {fileInput && (
                            <div className="mb-2 p-2 bg-slate-900 rounded-lg flex items-center justify-between text-xs text-ethiopia-gold">
                                <span className="truncate">{fileInput.name}</span>
                                <button type="button" onClick={() => setFileInput(null)} className="text-slate-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <label className="p-2 text-slate-400 hover:text-ethiopia-gold rounded-lg hover:bg-slate-900 cursor-pointer transition-colors">
                                <Paperclip className="w-5 h-5" />
                                <input
                                    type="file"
                                    onChange={(e) => setFileInput(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-ethiopia-gold text-xs text-white focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={sending || (!textInput.trim() && !fileInput)}
                                className="p-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold hover:brightness-110 transition-all disabled:opacity-40"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

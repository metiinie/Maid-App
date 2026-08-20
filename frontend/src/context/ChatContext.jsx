import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const { user, admin } = useAuth();
    const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeAgency, setActiveAgency] = useState(null);

    // Poll for unread notifications count
    useEffect(() => {
        if (!user && !admin) return;

        async function fetchUnread() {
            try {
                const res = await chatService.getUnreadCount();
                setUnreadNotifsCount(res.data.unread_count || 0);
            } catch (err) {
                // silent catch
            }
        }

        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [user, admin]);

    const openChatWithAgency = (agencyId, agencyName = 'Agency Support', contextType = 'candidate_inquiry', contextId = null) => {
        setActiveAgency({ id: agencyId, name: agencyName, contextType, contextId });
        setIsChatOpen(true);
    };

    const closeChat = () => {
        setIsChatOpen(false);
    };

    return (
        <ChatContext.Provider
            value={{
                unreadNotifsCount,
                setUnreadNotifsCount,
                isChatOpen,
                activeConversationId,
                setActiveConversationId,
                activeAgency,
                openChatWithAgency,
                closeChat
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}

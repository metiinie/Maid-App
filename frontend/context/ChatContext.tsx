import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './AuthContext';

type ActiveAgency = {
    id: string;
    name: string;
    contextType: string;
    contextId: string | null;
};

type ChatContextType = {
    unreadNotifsCount: number;
    isChatOpen: boolean;
    activeAgency: ActiveAgency | null;
    openChatWithAgency: (agencyId: string, agencyName?: string, contextType?: string, contextId?: string | null) => void;
    closeChat: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user, admin } = useAuth();
    const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeAgency, setActiveAgency] = useState<ActiveAgency | null>(null);

    useEffect(() => {
        if (!user && !admin) return;

        async function fetchUnread() {
            try {
                const res: any = await chatService.getUnreadCount();
                setUnreadNotifsCount(res.data?.unread_count || 0);
            } catch { }
        }

        fetchUnread();
        const interval = setInterval(fetchUnread, 15000);
        return () => clearInterval(interval);
    }, [user, admin]);

    const openChatWithAgency = (
        agencyId: string,
        agencyName = 'Agency Support',
        contextType = 'candidate_inquiry',
        contextId: string | null = null
    ) => {
        setActiveAgency({ id: agencyId, name: agencyName, contextType, contextId });
        setIsChatOpen(true);
    };

    const closeChat = () => {
        setIsChatOpen(false);
    };

    return (
        <ChatContext.Provider value={{ unreadNotifsCount, isChatOpen, activeAgency, openChatWithAgency, closeChat }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
}

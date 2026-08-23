import api from './api';

export const chatService = {
    getUserConversations: () =>
        api.get('/conversations'),

    getOrCreateConversation: (agencyId: string, contextType = 'candidate_inquiry', contextId: string | null = null) =>
        api.post('/conversations', { agencyId, agency_id: agencyId, context_type: contextType, context_id: contextId }),

    getMessages: (conversationId: string, isAdmin = false) =>
        api.get(isAdmin ? `/admin/conversations/${conversationId}/messages` : `/conversations/${conversationId}/messages`),

    sendUserMessage: (conversationId: string, payload: { text: string; attachmentUrl?: string } | FormData) => {
        if (payload instanceof FormData) {
            return api.post(`/conversations/${conversationId}/messages`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.post(`/conversations/${conversationId}/messages`, payload);
    },

    getAdminConversations: () =>
        api.get('/admin/conversations'),

    sendAdminMessage: (conversationId: string, payload: { text: string; attachmentUrl?: string } | FormData) => {
        if (payload instanceof FormData) {
            return api.post(`/admin/conversations/${conversationId}/messages`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        return api.post(`/admin/conversations/${conversationId}/messages`, payload);
    },

    getNotifications: () =>
        api.get('/notifications'),

    getUnreadCount: () =>
        api.get('/notifications/unread-count'),

    markNotificationRead: (id: string) =>
        api.patch(`/notifications/${id}/read`),

    markAllNotificationsRead: () =>
        api.patch('/notifications/read-all'),
};


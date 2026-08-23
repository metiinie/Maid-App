import api from './api';

export const chatService = {
    getUserConversations: () =>
        api.get('/conversations'),

    getOrCreateConversation: (agencyId: string, contextType = 'candidate_inquiry', contextId: string | null = null) =>
        api.post('/conversations', { agencyId, agency_id: agencyId, context_type: contextType, context_id: contextId }),

    getMessages: (conversationId: string, isAdmin = false) =>
        api.get(isAdmin ? `/admin/conversations/${conversationId}/messages` : `/conversations/${conversationId}/messages`),

    sendUserMessage: (conversationId: string, formData: FormData) =>
        api.post(`/conversations/${conversationId}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getAdminConversations: () =>
        api.get('/admin/conversations'),

    sendAdminMessage: (conversationId: string, formData: FormData) =>
        api.post(`/admin/conversations/${conversationId}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    getNotifications: () =>
        api.get('/notifications'),

    getUnreadCount: () =>
        api.get('/notifications/unread-count'),

    markNotificationRead: (id: string) =>
        api.patch(`/notifications/${id}/read`),

    markAllNotificationsRead: () =>
        api.patch('/notifications/read-all'),
};

import api from './api';

export const chatService = {
    // User Conversations List
    getUserConversations: () =>
        api.get('/conversations'),

    // User Create/Get Conversation
    getOrCreateConversation: (agencyId, contextType = 'candidate_inquiry', contextId = null) =>
        api.post('/conversations', { agency_id: agencyId, context_type: contextType, context_id: contextId }),

    // Get Conversation Messages History
    getMessages: (conversationId, isAdmin = false) =>
        api.get(isAdmin ? `/admin/conversations/${conversationId}/messages` : `/conversations/${conversationId}/messages`),

    // User Send Message (Multipart with optional attachment)
    sendUserMessage: (conversationId, formData) =>
        api.post(`/conversations/${conversationId}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Admin Conversations List
    getAdminConversations: () =>
        api.get('/admin/conversations'),

    // Admin Send Message (Multipart with optional attachment)
    sendAdminMessage: (conversationId, formData) =>
        api.post(`/admin/conversations/${conversationId}/messages`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Get Notifications
    getNotifications: () =>
        api.get('/notifications'),

    // Get Unread Notifications Count
    getUnreadCount: () =>
        api.get('/notifications/unread-count'),

    // Mark Notification Read
    markNotificationRead: (id) =>
        api.patch(`/notifications/${id}/read`),

    // Mark All Notifications Read
    markAllNotificationsRead: () =>
        api.patch('/notifications/read-all')
};

const db = require('../config/db');
const { sendPushNotification } = require('../services/push.service');
const { uploadToS3 } = require('../services/storage.service');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/conversations — User list conversations
async function getUserConversations(req, res) {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            `SELECT c.*, g.name as agency_name, g.logo_url as agency_logo, g.phone as agency_phone
       FROM conversations c
       JOIN agencies g ON g.id = c.agency_id
       WHERE c.user_id = $1 AND c.is_archived = false
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
            [userId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getUserConversations error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch conversations' });
    }
}

// POST /api/conversations — User initialize/get conversation
async function getOrCreateConversation(req, res) {
    try {
        const userId = req.user.id;
        const { agency_id, context_type, context_id } = req.body;

        if (!agency_id) {
            return errorResponse(res, { statusCode: 400, message: 'agency_id is required' });
        }

        // Check if conversation already exists
        let query = 'SELECT * FROM conversations WHERE user_id = $1 AND agency_id = $2';
        const params = [userId, agency_id];

        if (context_type && context_id) {
            query += ' AND context_type = $3 AND context_id = $4';
            params.push(context_type, context_id);
        } else {
            query += ' AND context_type IS NULL';
        }

        const { rows: existingRows } = await db.query(query, params);
        if (existingRows.length > 0) {
            return successResponse(res, { data: existingRows[0] });
        }

        // Create new conversation
        const { rows: newRows } = await db.query(
            `INSERT INTO conversations (agency_id, user_id, context_type, context_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [agency_id, userId, context_type || null, context_id || null]
        );

        return successResponse(res, { statusCode: 201, data: newRows[0] });
    } catch (err) {
        console.error('getOrCreateConversation error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to start conversation' });
    }
}

// GET /api/conversations/:id/messages — Get message history
async function getMessages(req, res) {
    try {
        const { id: conversationId } = req.params;
        const isUser = !!req.user;
        const isAdmin = !!req.admin;

        // Reset unread count
        if (isUser) {
            await db.query('UPDATE conversations SET user_unread_count = 0 WHERE id = $1 AND user_id = $2', [conversationId, req.user.id]);
        } else if (isAdmin) {
            await db.query('UPDATE conversations SET admin_unread_count = 0 WHERE id = $1 AND agency_id = $2', [conversationId, req.agencyId]);
        }

        const { rows } = await db.query(
            `SELECT m.*,
              u.first_name as user_first_name, u.last_name as user_last_name,
              a.first_name as admin_first_name, a.last_name as admin_last_name
       FROM messages m
       LEFT JOIN users u ON u.id = m.sender_user_id
       LEFT JOIN admin_users a ON a.id = m.sender_admin_id
       WHERE m.conversation_id = $1
       ORDER BY m.sent_at ASC`,
            [conversationId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getMessages error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch messages' });
    }
}

// POST /api/conversations/:id/messages — User send message
async function sendUserMessage(req, res) {
    const client = await db.pool.connect();
    try {
        const userId = req.user.id;
        const { id: conversationId } = req.params;
        const { message_text, attachment_url: bodyUrl, attachment_type } = req.body;

        let attachmentUrl = bodyUrl;
        if (req.file) {
            attachmentUrl = await uploadToS3(req.file, 'chat-attachments');
        }

        if (!message_text && !attachmentUrl) {
            return errorResponse(res, { statusCode: 400, message: 'Message text or attachment is required' });
        }

        await client.query('BEGIN');

        // Verify conversation
        const { rows: convRows } = await client.query(
            'SELECT id, agency_id FROM conversations WHERE id = $1 AND user_id = $2',
            [conversationId, userId]
        );

        const conv = convRows[0];
        if (!conv) {
            await client.query('ROLLBACK');
            return errorResponse(res, { statusCode: 404, message: 'Conversation not found' });
        }

        const previewText = message_text ? (message_text.length > 100 ? message_text.substring(0, 100) + '...' : message_text) : '[Attachment]';

        const { rows: msgRows } = await client.query(
            `INSERT INTO messages (conversation_id, sender_type, sender_user_id, message_text, attachment_url, attachment_type)
       VALUES ($1, 'user', $2, $3, $4, $5)
       RETURNING *`,
            [conversationId, userId, message_text || null, attachmentUrl || null, attachment_type || null]
        );

        await client.query(
            `UPDATE conversations
       SET last_message_at = NOW(), last_message_preview = $1, admin_unread_count = admin_unread_count + 1, updated_at = NOW()
       WHERE id = $2`,
            [previewText, conversationId]
        );

        await client.query('COMMIT');

        return successResponse(res, { statusCode: 201, data: msgRows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('sendUserMessage error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to send message' });
    } finally {
        client.release();
    }
}

// GET /api/admin/conversations — Admin list conversations
async function getAdminConversations(req, res) {
    try {
        const agencyId = req.agencyId;
        const { rows } = await db.query(
            `SELECT c.*, u.first_name as user_first_name, u.last_name as user_last_name, u.phone as user_phone, u.email as user_email
       FROM conversations c
       JOIN users u ON u.id = c.user_id
       WHERE c.agency_id = $1 AND c.is_archived = false
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
            [agencyId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getAdminConversations error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch admin conversations' });
    }
}

// POST /api/admin/conversations/:id/messages — Admin send message
async function sendAdminMessage(req, res) {
    const client = await db.pool.connect();
    try {
        const agencyId = req.agencyId;
        const adminUserId = req.admin.id;
        const { id: conversationId } = req.params;
        const { message_text, attachment_url: bodyUrl, attachment_type } = req.body;

        let attachmentUrl = bodyUrl;
        if (req.file) {
            attachmentUrl = await uploadToS3(req.file, 'chat-attachments');
        }

        if (!message_text && !attachmentUrl) {
            return errorResponse(res, { statusCode: 400, message: 'Message text or attachment is required' });
        }

        await client.query('BEGIN');

        // Verify conversation
        const { rows: convRows } = await client.query(
            'SELECT id, user_id FROM conversations WHERE id = $1 AND agency_id = $2',
            [conversationId, agencyId]
        );

        const conv = convRows[0];
        if (!conv) {
            await client.query('ROLLBACK');
            return errorResponse(res, { statusCode: 404, message: 'Conversation not found' });
        }

        const previewText = message_text ? (message_text.length > 100 ? message_text.substring(0, 100) + '...' : message_text) : '[Attachment]';

        const { rows: msgRows } = await client.query(
            `INSERT INTO messages (conversation_id, sender_type, sender_admin_id, message_text, attachment_url, attachment_type)
       VALUES ($1, 'admin', $2, $3, $4, $5)
       RETURNING *`,
            [conversationId, adminUserId, message_text || null, attachmentUrl || null, attachment_type || null]
        );

        await client.query(
            `UPDATE conversations
       SET last_message_at = NOW(), last_message_preview = $1, user_unread_count = user_unread_count + 1, updated_at = NOW()
       WHERE id = $2`,
            [previewText, conversationId]
        );

        // Create notification entry for user
        await client.query(
            `INSERT INTO notifications (agency_id, user_id, title, body, type, action_type, action_id)
       VALUES ($1, $2, $3, $4, 'general', 'open_pipeline', $5)`,
            [agencyId, conv.user_id, 'New Message from Agency', previewText, conversationId]
        );

        await client.query('COMMIT');

        // Send async push notification to user device
        sendPushNotification(conv.user_id, {
            title: 'New Message from Agency',
            body: previewText,
            data: { conversation_id: conversationId }
        }).catch(e => console.error('Push notification error:', e));

        return successResponse(res, { statusCode: 201, data: msgRows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('sendAdminMessage error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to send admin message' });
    } finally {
        client.release();
    }
}

module.exports = {
    getUserConversations,
    getOrCreateConversation,
    getMessages,
    sendUserMessage,
    getAdminConversations,
    sendAdminMessage
};

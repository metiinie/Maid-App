const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/notifications
async function getNotifications(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        const adminId = req.admin ? req.admin.id : null;
        const { page = 1, limit = 20 } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [];
        let queryWhere = '';

        if (userId) {
            queryWhere = 'WHERE user_id = $1';
            params.push(userId);
        } else if (adminId) {
            queryWhere = 'WHERE admin_user_id = $1';
            params.push(adminId);
        } else {
            return errorResponse(res, { statusCode: 401, message: 'Authentication required' });
        }

        const countRes = await db.query(`SELECT COUNT(*) FROM notifications ${queryWhere}`, params);
        const totalItems = parseInt(countRes.rows[0].count, 10);

        const itemsQuery = `
      SELECT * FROM notifications
      ${queryWhere}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(parseInt(limit, 10), offset);
        const { rows } = await db.query(itemsQuery, params);

        return successResponse(res, {
            data: rows,
            meta: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit, 10))
            }
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch notifications' });
    }
}

// GET /api/notifications/unread-count
async function getUnreadCount(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        const adminId = req.admin ? req.admin.id : null;

        let query = '';
        let params = [];

        if (userId) {
            query = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false';
            params = [userId];
        } else if (adminId) {
            query = 'SELECT COUNT(*) FROM notifications WHERE admin_user_id = $1 AND is_read = false';
            params = [adminId];
        } else {
            return errorResponse(res, { statusCode: 401, message: 'Authentication required' });
        }

        const { rows } = await db.query(query, params);
        return successResponse(res, { data: { unread_count: parseInt(rows[0].count, 10) } });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to count unread notifications' });
    }
}

// PATCH /api/notifications/:id/read
async function markAsRead(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user ? req.user.id : null;
        const adminId = req.admin ? req.admin.id : null;

        let query = '';
        let params = [];

        if (userId) {
            query = 'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *';
            params = [id, userId];
        } else if (adminId) {
            query = 'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND admin_user_id = $2 RETURNING *';
            params = [id, adminId];
        }

        const { rows } = await db.query(query, params);
        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Notification not found' });
        }

        return successResponse(res, { message: 'Notification marked as read', data: rows[0] });
    } catch (err) {
        console.error('markAsRead error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update notification' });
    }
}

// PATCH /api/notifications/read-all
async function markAllAsRead(req, res) {
    try {
        const userId = req.user ? req.user.id : null;
        const adminId = req.admin ? req.admin.id : null;

        let query = '';
        let params = [];

        if (userId) {
            query = 'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false';
            params = [userId];
        } else if (adminId) {
            query = 'UPDATE notifications SET is_read = true, read_at = NOW() WHERE admin_user_id = $1 AND is_read = false';
            params = [adminId];
        }

        await db.query(query, params);
        return successResponse(res, { message: 'All notifications marked as read' });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to mark notifications as read' });
    }
}

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};

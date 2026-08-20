const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const userAuth = require('../middleware/userAuth');
const adminAuth = require('../middleware/adminAuth');

// Flexible auth middleware trying userAuth then adminAuth
function flexibleAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Authorization header required' } });
    }

    // Try userAuth first
    userAuth(req, res, (err) => {
        if (!err && req.user) return next();
        // Fallback to adminAuth
        adminAuth(req, res, (err2) => {
            if (!err2 && req.admin) return next();
            return res.status(401).json({ success: false, error: { statusCode: 401, message: 'Invalid token' } });
        });
    });
}

router.use(flexibleAuth);

// GET /api/notifications — List notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count — Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /api/notifications/read-all — Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /api/notifications/:id/read — Mark single as read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;

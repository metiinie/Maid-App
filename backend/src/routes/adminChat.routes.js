const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

router.use(adminAuth);

// GET /api/admin/conversations — Admin list agency conversations
router.get('/', chatController.getAdminConversations);

// GET /api/admin/conversations/:id/messages — Admin get message history
router.get('/:id/messages', chatController.getMessages);

// POST /api/admin/conversations/:id/messages — Admin send message
router.post(
    '/:id/messages',
    upload.single('attachment'),
    chatController.sendAdminMessage
);

module.exports = router;

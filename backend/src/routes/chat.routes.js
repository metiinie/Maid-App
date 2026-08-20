const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const userAuth = require('../middleware/userAuth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

router.use(userAuth);

// GET /api/conversations — User list conversations
router.get('/', chatController.getUserConversations);

// POST /api/conversations — User create or get conversation
router.post(
    '/',
    [
        body('agency_id').isUUID().withMessage('Valid agency_id is required'),
        validate
    ],
    chatController.getOrCreateConversation
);

// GET /api/conversations/:id/messages — Get message history
router.get('/:id/messages', chatController.getMessages);

// POST /api/conversations/:id/messages — User send message
router.post(
    '/:id/messages',
    upload.single('attachment'),
    chatController.sendUserMessage
);

module.exports = router;

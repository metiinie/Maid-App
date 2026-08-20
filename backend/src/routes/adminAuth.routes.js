const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuth.controller');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/admin/auth/login
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
        validate
    ],
    adminAuthController.adminLogin
);

// GET /api/admin/auth/me
router.get('/me', adminAuth, adminAuthController.getAdminProfile);

module.exports = router;

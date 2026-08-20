const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post(
    '/register',
    authLimiter,
    [
        body('first_name').trim().notEmpty().withMessage('First name is required'),
        body('last_name').trim().notEmpty().withMessage('Last name is required'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('preferred_mode').optional().isIn(['job_seeker', 'employer']).withMessage('Invalid mode'),
        validate
    ],
    authController.register
);

// POST /api/auth/otp/send
router.post(
    '/otp/send',
    authLimiter,
    [
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('purpose').optional().isIn(['registration', 'password_reset', 'login']),
        validate
    ],
    authController.sendOTPCode
);

// POST /api/auth/otp/verify
router.post(
    '/otp/verify',
    authLimiter,
    [
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('otp_code').trim().notEmpty().withMessage('OTP code is required'),
        body('purpose').optional().isIn(['registration', 'password_reset', 'login']),
        validate
    ],
    authController.verifyOTPCode
);

// POST /api/auth/login
router.post(
    '/login',
    authLimiter,
    [
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('password').notEmpty().withMessage('Password is required'),
        validate
    ],
    authController.login
);

// POST /api/auth/forgot-password
router.post(
    '/forgot-password',
    authLimiter,
    [
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        validate
    ],
    authController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
    '/reset-password',
    authLimiter,
    [
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('otp_code').trim().notEmpty().withMessage('OTP code is required'),
        body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
        validate
    ],
    authController.resetPassword
);

// PUT /api/auth/mode
router.put(
    '/mode',
    userAuth,
    [
        body('mode').isIn(['job_seeker', 'employer']).withMessage('Mode must be job_seeker or employer'),
        validate
    ],
    authController.switchMode
);

module.exports = router;

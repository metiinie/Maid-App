const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validator');

// All user routes require user JWT
router.use(userAuth);

// GET /api/users/me
router.get('/me', userController.getProfile);

// PUT /api/users/me
router.put(
    '/me',
    [
        body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
        body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
        body('email').optional().isEmail().withMessage('Invalid email format'),
        validate
    ],
    userController.updateProfile
);

// PUT /api/users/me/jobseeker-profile
router.put('/me/jobseeker-profile', userController.updateJobseekerProfile);

// POST /api/users/me/device-token
router.post(
    '/me/device-token',
    [
        body('token').trim().notEmpty().withMessage('FCM device token is required'),
        body('platform').isIn(['ios', 'android']).withMessage('Platform must be ios or android'),
        validate
    ],
    userController.registerDeviceToken
);

module.exports = router;

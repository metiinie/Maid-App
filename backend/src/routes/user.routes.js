const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const publicCandidateController = require('../controllers/publicCandidate.controller');
const publicVacancyController = require('../controllers/publicVacancy.controller');
const userPipelineController = require('../controllers/userPipeline.controller');
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

// GET /api/users/me/inquiries — User candidate inquiries
router.get('/me/inquiries', publicCandidateController.getUserInquiries);

// GET /api/users/me/applications — User job applications
router.get('/me/applications', publicVacancyController.getUserApplications);

// GET /api/users/me/pipelines — User deployment & hiring pipelines
router.get('/me/pipelines', userPipelineController.getUserPipelines);

// GET /api/users/me/pipelines/:id — User pipeline detail timeline & documents
router.get('/me/pipelines/:id', userPipelineController.getUserPipelineById);

module.exports = router;

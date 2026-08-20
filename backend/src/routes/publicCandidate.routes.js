const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const publicCandidateController = require('../controllers/publicCandidate.controller');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validator');

// Optional auth middleware so logged-in users populate req.user on public endpoints
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return userAuth(req, res, next);
    }
    next();
}

// GET /api/candidates — Public catalog search
router.get('/', publicCandidateController.getPublicCandidates);

// GET /api/candidates/featured — Featured carousel
router.get('/featured', publicCandidateController.getFeaturedCandidates);

// GET /api/candidates/:id — Public candidate details
router.get('/:id', publicCandidateController.getPublicCandidateById);

// POST /api/candidates/:id/inquiry — Submit candidate inquiry
router.post(
    '/:id/inquiry',
    optionalAuth,
    [
        body('employer_name').trim().notEmpty().withMessage('Employer name is required'),
        body('employer_phone').trim().notEmpty().withMessage('Employer phone is required'),
        body('employer_email').optional().isEmail().withMessage('Invalid email address'),
        validate
    ],
    publicCandidateController.createInquiry
);

module.exports = router;

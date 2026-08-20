const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const publicCandidateController = require('../controllers/publicCandidate.controller');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validator');

// GET /api/candidates — Public catalog search
router.get('/', publicCandidateController.getPublicCandidates);

// GET /api/candidates/featured — Featured carousel
router.get('/featured', publicCandidateController.getFeaturedCandidates);

// GET /api/candidates/:id — Public candidate details
router.get('/:id', publicCandidateController.getPublicCandidateById);

// POST /api/candidates/:id/inquiry — Submit candidate inquiry (Requires User Auth)
router.post(
    '/:id/inquiry',
    userAuth,
    [
        body('message').optional().trim(),
        body('preferred_contact_channel')
            .optional()
            .isIn(['phone', 'whatsapp', 'telegram', 'imo', 'email', 'in_app', 'website'])
            .withMessage('Invalid contact channel'),
        validate
    ],
    publicCandidateController.createInquiry
);

module.exports = router;

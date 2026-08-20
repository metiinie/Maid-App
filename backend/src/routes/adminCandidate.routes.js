const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

// All candidate routes require admin authentication
router.use(adminAuth);

// GET /api/admin/candidates — List candidates
router.get('/', candidateController.getCandidates);

// POST /api/admin/candidates — Create candidate
router.post(
    '/',
    [
        body('first_name').trim().notEmpty().withMessage('First name is required'),
        body('last_name').trim().notEmpty().withMessage('Last name is required'),
        body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
        body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
        validate
    ],
    candidateController.createCandidate
);

// GET /api/admin/candidates/:id — Get details
router.get('/:id', candidateController.getCandidateById);

// PUT /api/admin/candidates/:id — Update candidate
router.put('/:id', candidateController.updateCandidate);

// DELETE /api/admin/candidates/:id — Delete candidate
router.delete('/:id', candidateController.deleteCandidate);

// POST /api/admin/candidates/:id/photo — Upload photo
router.post('/:id/photo', upload.single('photo'), candidateController.uploadPhoto);

// POST /api/admin/candidates/:id/video — Upload introduction video
router.post('/:id/video', upload.single('video'), candidateController.uploadVideo);

// POST /api/admin/candidates/:id/documents — Upload document
router.post('/:id/documents', upload.single('document'), candidateController.uploadDocument);

// DELETE /api/admin/candidates/:id/documents/:docId — Delete document
router.delete('/:id/documents/:docId', candidateController.deleteDocument);

// PATCH /api/admin/candidates/:id/medical — Update medical status
router.patch(
    '/:id/medical',
    [
        body('status').isIn(['pending', 'cleared', 'not_cleared']).withMessage('Invalid medical status'),
        validate
    ],
    candidateController.updateMedicalStatus
);

// PATCH /api/admin/candidates/:id/featured — Toggle featured
router.patch(
    '/:id/featured',
    [
        body('is_featured').isBoolean().withMessage('is_featured must be a boolean'),
        validate
    ],
    candidateController.toggleFeatured
);

// PATCH /api/admin/candidates/:id/active — Toggle active
router.patch(
    '/:id/active',
    [
        body('is_active').isBoolean().withMessage('is_active must be a boolean'),
        validate
    ],
    candidateController.toggleActive
);

module.exports = router;

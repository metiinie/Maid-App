const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminPipelineController = require('../controllers/adminPipeline.controller');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validator');

// All admin pipeline routes require admin auth
router.use(adminAuth);

// GET /api/admin/pipelines — List hiring pipelines
router.get('/', adminPipelineController.getPipelines);

// POST /api/admin/pipelines — Initialize hiring pipeline
router.post(
    '/',
    [
        body('candidate_id').isUUID().withMessage('Valid candidate_id is required'),
        body('current_stage')
            .optional()
            .isIn(['interviewing', 'medical_biometrics', 'visa_processing', 'pre_departure_training', 'deployed'])
            .withMessage('Invalid pipeline stage'),
        validate
    ],
    adminPipelineController.createPipeline
);

// GET /api/admin/pipelines/:id — Get pipeline details
router.get('/:id', adminPipelineController.getPipelineById);

// PATCH /api/admin/pipelines/:id/stage — Advance pipeline stage
router.patch(
    '/:id/stage',
    [
        body('stage')
            .isIn(['interviewing', 'medical_biometrics', 'visa_processing', 'pre_departure_training', 'deployed'])
            .withMessage('Invalid pipeline stage'),
        validate
    ],
    adminPipelineController.updatePipelineStage
);

// PATCH /api/admin/pipelines/:id/outcome — Finalize pipeline outcome
router.patch(
    '/:id/outcome',
    [
        body('outcome')
            .isIn(['successful', 'cancelled', 'candidate_withdrew', 'employer_cancelled'])
            .withMessage('Invalid pipeline outcome'),
        validate
    ],
    adminPipelineController.updatePipelineOutcome
);

// POST /api/admin/pipelines/:id/documents — Upload document for pipeline
router.post(
    '/:id/documents',
    upload.single('document'),
    [
        body('document_type').trim().notEmpty().withMessage('Document type is required'),
        validate
    ],
    adminPipelineController.uploadPipelineDocument
);

// DELETE /api/admin/pipelines/:id/documents/:docId — Delete document from pipeline
router.delete('/:id/documents/:docId', adminPipelineController.deletePipelineDocument);

module.exports = router;

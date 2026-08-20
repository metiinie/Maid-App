const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminVacancyController = require('../controllers/adminVacancy.controller');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validator');

// All admin vacancy routes require admin authentication
router.use(adminAuth);

// GET /api/admin/vacancies — List vacancies
router.get('/', adminVacancyController.getVacancies);

// POST /api/admin/vacancies — Create job vacancy
router.post(
    '/',
    [
        body('title').trim().notEmpty().withMessage('Vacancy title is required'),
        body('destination_country').trim().notEmpty().withMessage('Destination country is required'),
        body('status').optional().isIn(['draft', 'active', 'paused', 'closed', 'expired']).withMessage('Invalid status'),
        validate
    ],
    adminVacancyController.createVacancy
);

// GET /api/admin/vacancies/:id — Get vacancy detail
router.get('/:id', adminVacancyController.getVacancyById);

// PUT /api/admin/vacancies/:id — Update vacancy
router.put('/:id', adminVacancyController.updateVacancy);

// DELETE /api/admin/vacancies/:id — Delete vacancy
router.delete('/:id', adminVacancyController.deleteVacancy);

// PATCH /api/admin/vacancies/:id/status — Update vacancy status
router.patch(
    '/:id/status',
    [
        body('status').isIn(['draft', 'active', 'paused', 'closed', 'expired']).withMessage('Invalid status'),
        validate
    ],
    adminVacancyController.updateVacancyStatus
);

// GET /api/admin/vacancies/:id/applications — List applications for vacancy
router.get('/:id/applications', adminVacancyController.getVacancyApplications);

// PATCH /api/admin/applications/:id/status — Update application status
router.patch(
    '/applications/:id/status',
    [
        body('status').isIn(['submitted', 'under_review', 'shortlisted', 'selected', 'rejected', 'withdrawn']).withMessage('Invalid application status'),
        validate
    ],
    adminVacancyController.updateApplicationStatus
);

module.exports = router;

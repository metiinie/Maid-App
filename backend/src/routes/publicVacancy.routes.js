const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const publicVacancyController = require('../controllers/publicVacancy.controller');
const userAuth = require('../middleware/userAuth');
const validate = require('../middleware/validator');

// GET /api/vacancies — Search public job vacancies catalog
router.get('/', publicVacancyController.getPublicVacancies);

// GET /api/vacancies/featured — Featured vacancies list
router.get('/featured', publicVacancyController.getFeaturedVacancies);

// GET /api/vacancies/:id — Get vacancy detail
router.get('/:id', publicVacancyController.getPublicVacancyById);

// POST /api/vacancies/:id/apply — Submit application for vacancy (Requires User Auth)
router.post(
    '/:id/apply',
    userAuth,
    [
        body('cover_letter').optional().trim(),
        validate
    ],
    publicVacancyController.applyForVacancy
);

module.exports = router;

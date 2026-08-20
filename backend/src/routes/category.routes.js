const express = require('express');
const router = express.Router();
const publicCandidateController = require('../controllers/publicCandidate.controller');

// GET /api/categories — List active job categories
router.get('/', publicCandidateController.getCategories);

module.exports = router;

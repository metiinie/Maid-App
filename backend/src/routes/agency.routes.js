const express = require('express');
const router = express.Router();
const publicCandidateController = require('../controllers/publicCandidate.controller');

// GET /api/agencies — List verified recruitment agencies
router.get('/', publicCandidateController.getAgencies);

module.exports = router;

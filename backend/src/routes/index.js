const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminAuthRoutes = require('./adminAuth.routes');
const userRoutes = require('./user.routes');
const adminCandidateRoutes = require('./adminCandidate.routes');
const publicCandidateRoutes = require('./publicCandidate.routes');
const categoryRoutes = require('./category.routes');
const agencyRoutes = require('./agency.routes');
const adminVacancyRoutes = require('./adminVacancy.routes');
const publicVacancyRoutes = require('./publicVacancy.routes');

// Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Ethiopian Recruitment Agency SaaS Backend',
        timestamp: new Date().toISOString()
    });
});

// Route Mounts
router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/users', userRoutes);
router.use('/admin/candidates', adminCandidateRoutes);
router.use('/candidates', publicCandidateRoutes);
router.use('/categories', categoryRoutes);
router.use('/agencies', agencyRoutes);
router.use('/admin/vacancies', adminVacancyRoutes);
router.use('/vacancies', publicVacancyRoutes);

module.exports = router;

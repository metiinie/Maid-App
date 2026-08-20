const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminAuthRoutes = require('./adminAuth.routes');
const userRoutes = require('./user.routes');
const adminCandidateRoutes = require('./adminCandidate.routes');

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

module.exports = router;

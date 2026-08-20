const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');

// GET /api/subscriptions/plans — List active subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

module.exports = router;

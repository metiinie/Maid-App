const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const adminAuth = require('../middleware/adminAuth');
const validate = require('../middleware/validator');

router.use(adminAuth);

// GET /api/admin/subscription — Get current agency subscription & usage
router.get('/', subscriptionController.getAgencySubscription);

// POST /api/admin/subscription/checkout — Initialize checkout session
router.post(
    '/checkout',
    [
        body('plan_id').isUUID().withMessage('Valid plan_id is required'),
        body('billing_cycle').optional().isIn(['monthly', 'yearly']).withMessage('Billing cycle must be monthly or yearly'),
        body('payment_provider').optional().isIn(['chapa', 'telebirr', 'stripe', 'bank_transfer', 'manual']).withMessage('Invalid payment provider'),
        validate
    ],
    subscriptionController.initializeCheckout
);

// POST /api/admin/subscription/verify — Verify payment transaction
router.post(
    '/verify',
    [
        body('tx_ref').trim().notEmpty().withMessage('tx_ref reference is required'),
        validate
    ],
    subscriptionController.verifyCheckoutPayment
);

// GET /api/admin/subscription/invoices — List agency invoices
router.get('/invoices', subscriptionController.getAgencyInvoices);

// GET /api/admin/subscription/transactions — List agency payment transactions
router.get('/transactions', subscriptionController.getAgencyTransactions);

module.exports = router;

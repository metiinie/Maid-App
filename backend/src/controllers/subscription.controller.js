const db = require('../config/db');
const { initializePayment, verifyPayment } = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/subscriptions/plans — Public list available subscription plans
async function getSubscriptionPlans(req, res) {
    try {
        const { rows } = await db.query(
            `SELECT * FROM subscription_plans
       WHERE is_active = true
       ORDER BY price ASC`
        );
        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getSubscriptionPlans error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch subscription plans' });
    }
}

// GET /api/admin/subscription — Admin get agency subscription & plan limits
async function getAgencySubscription(req, res) {
    try {
        const agencyId = req.agencyId;

        // Get active subscription
        const { rows: subRows } = await db.query(
            `SELECT s.*, p.name as plan_name, p.price, p.billing_cycle,
              p.max_candidates, p.max_job_postings, p.max_admin_users, p.features
       FROM agency_subscriptions s
       JOIN subscription_plans p ON p.id = s.plan_id
       WHERE s.agency_id = $1 AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`,
            [agencyId]
        );

        const subscription = subRows[0] || null;

        // Calculate usage stats
        const [candCount, vacCount, featCount] = await Promise.all([
            db.query('SELECT COUNT(*) FROM candidates WHERE agency_id = $1 AND is_active = true', [agencyId]),
            db.query("SELECT COUNT(*) FROM job_vacancies WHERE agency_id = $1 AND status = 'active'", [agencyId]),
            db.query('SELECT COUNT(*) FROM candidates WHERE agency_id = $1 AND is_featured = true', [agencyId])
        ]);

        const usage = {
            candidates_count: parseInt(candCount.rows[0].count, 10),
            active_vacancies_count: parseInt(vacCount.rows[0].count, 10),
            featured_candidates_count: parseInt(featCount.rows[0].count, 10)
        };

        return successResponse(res, {
            data: {
                subscription,
                usage
            }
        });
    } catch (err) {
        console.error('getAgencySubscription error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch agency subscription details' });
    }
}

// POST /api/admin/subscription/checkout — Initialize checkout for subscription upgrade/renewal
async function initializeCheckout(req, res) {
    const client = await db.pool.connect();
    try {
        const agencyId = req.agencyId;
        const { plan_id, payment_provider = 'chapa' } = req.body;

        // Verify plan
        const { rows: planRows } = await db.query(
            'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true',
            [plan_id]
        );

        const plan = planRows[0];
        if (!plan) {
            return errorResponse(res, { statusCode: 404, message: 'Subscription plan not found' });
        }

        const amount = plan.price;
        const currency = 'ETB';
        const txRef = `ref-sub-${agencyId.substring(0, 8)}-${Date.now()}`;
        const invoiceNumber = `INV-${Date.now()}`;

        await client.query('BEGIN');

        // Create draft invoice
        const { rows: invoiceRows } = await client.query(
            `INSERT INTO invoices (agency_id, invoice_number, amount, total_amount, currency, status, due_date, payment_method)
       VALUES ($1, $2, $3, $3, $4, 'draft', NOW() + INTERVAL '7 days', $5)
       RETURNING *`,
            [agencyId, invoiceNumber, amount, currency, payment_provider]
        );
        const invoice = invoiceRows[0];

        // Create payment transaction
        const { rows: txRows } = await client.query(
            `INSERT INTO payment_transactions (agency_id, provider, provider_tx_id, amount, currency, status, metadata)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6)
       RETURNING *`,
            [agencyId, payment_provider, txRef, amount, currency, JSON.stringify({ plan_id, invoice_id: invoice.id })]
        );

        await client.query('COMMIT');

        // Initialize provider payment
        const paymentResult = await initializePayment({
            provider: payment_provider,
            amount,
            currency,
            tx_ref: txRef,
            email: req.admin.email,
            first_name: req.admin.first_name,
            last_name: req.admin.last_name
        });

        return successResponse(res, {
            statusCode: 201,
            message: 'Checkout initialized successfully',
            data: {
                transaction_id: txRows[0].id,
                invoice_id: invoice.id,
                tx_ref: txRef,
                checkout_url: paymentResult.checkout_url,
                instructions: paymentResult.instructions,
                amount,
                currency,
                provider: payment_provider
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('initializeCheckout error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to initialize checkout session' });
    } finally {
        client.release();
    }
}

// POST /api/admin/subscription/verify — Verify payment reference & activate subscription
async function verifyCheckoutPayment(req, res) {
    const client = await db.pool.connect();
    try {
        const agencyId = req.agencyId;
        const { tx_ref, provider = 'chapa' } = req.body;

        if (!tx_ref) {
            return errorResponse(res, { statusCode: 400, message: 'Transaction reference tx_ref is required' });
        }

        await client.query('BEGIN');

        // Verify transaction record
        const { rows: txRows } = await client.query(
            'SELECT * FROM payment_transactions WHERE provider_tx_id = $1 AND agency_id = $2',
            [tx_ref, agencyId]
        );

        const tx = txRows[0];
        if (!tx) {
            await client.query('ROLLBACK');
            return errorResponse(res, { statusCode: 404, message: 'Payment transaction record not found' });
        }

        const verification = await verifyPayment({ provider: tx.provider || provider, tx_ref });

        if (!verification.success || verification.status !== 'completed') {
            await client.query('ROLLBACK');
            return errorResponse(res, { statusCode: 400, message: 'Payment verification failed or pending' });
        }

        // Update payment transaction
        await client.query(
            `UPDATE payment_transactions
       SET status = 'completed', paid_at = NOW()
       WHERE id = $1`,
            [tx.id]
        );

        const metadata = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : (tx.metadata || {});
        const planId = metadata.plan_id;
        const invoiceId = metadata.invoice_id;

        // Update invoice
        if (invoiceId) {
            await client.query(
                `UPDATE invoices
         SET status = 'paid', paid_at = NOW(), payment_method = $1
         WHERE id = $2`,
                [tx.provider, invoiceId]
            );
        }

        // Deactivate prior active subscriptions
        await client.query(
            "UPDATE agency_subscriptions SET status = 'expired' WHERE agency_id = $1 AND status = 'active'",
            [agencyId]
        );

        // Create active subscription record
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const { rows: subRows } = await client.query(
            `INSERT INTO agency_subscriptions (
         agency_id, plan_id, status, start_date, end_date, amount_paid, payment_method, payment_reference
       ) VALUES ($1, $2, 'active', $3, $4, $5, $6, $7)
       RETURNING *`,
            [agencyId, planId, startDate, endDate, tx.amount, tx.provider, tx_ref]
        );

        // Also link subscription_id on payment_transactions and invoices
        await client.query(
            'UPDATE payment_transactions SET subscription_id = $1 WHERE id = $2',
            [subRows[0].id, tx.id]
        );
        if (invoiceId) {
            await client.query(
                'UPDATE invoices SET subscription_id = $1 WHERE id = $2',
                [subRows[0].id, invoiceId]
            );
        }

        await client.query('COMMIT');

        return successResponse(res, {
            message: 'Payment verified and subscription activated successfully',
            data: {
                subscription: subRows[0],
                transaction_status: 'completed'
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('verifyCheckoutPayment error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to verify payment' });
    } finally {
        client.release();
    }
}

// GET /api/admin/subscription/invoices — List agency invoices
async function getAgencyInvoices(req, res) {
    try {
        const agencyId = req.agencyId;
        const { rows } = await db.query(
            'SELECT * FROM invoices WHERE agency_id = $1 ORDER BY created_at DESC',
            [agencyId]
        );
        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getAgencyInvoices error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch agency invoices' });
    }
}

// GET /api/admin/subscription/transactions — List agency transactions
async function getAgencyTransactions(req, res) {
    try {
        const agencyId = req.agencyId;
        const { rows } = await db.query(
            'SELECT * FROM payment_transactions WHERE agency_id = $1 ORDER BY created_at DESC',
            [agencyId]
        );
        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getAgencyTransactions error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch payment transactions' });
    }
}

module.exports = {
    getSubscriptionPlans,
    getAgencySubscription,
    initializeCheckout,
    verifyCheckoutPayment,
    getAgencyInvoices,
    getAgencyTransactions
};

const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5007;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 7 Agency Subscriptions & Payments Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('77777777-7777-4777-8777-777777777777', 'Subscription Agency Phase7', 'test-agency-p7', 'p7@testagency.com', '+251911777777', true, true)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', $1, 'Billing', 'Admin', 'p7admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, agency_id = EXCLUDED.agency_id`,
            [agencyId, adminPasswordHash]
        );

        // Get a plan ID from subscription_plans seed
        const planRes = await db.query("SELECT id, name FROM subscription_plans WHERE slug = 'agency_pro' OR is_active = true LIMIT 1");
        if (planRes.rows.length === 0) throw new Error('No subscription plans found in database seed');
        const planId = planRes.rows[0].id;

        // 2. Start HTTP server
        server = app.listen(PORT);
        console.log(`✓ Test HTTP server listening on port ${PORT}\n`);

        // Helper fetch wrapper
        async function apiRequest(endpoint, options = {}) {
            const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            const data = await res.json();
            return { status: res.status, data };
        }

        // 3. GET Public Subscription Plans
        console.log('2️⃣ Testing GET /api/subscriptions/plans...');
        const plansRes = await apiRequest('/subscriptions/plans');
        console.log('   Status:', plansRes.status, '| Total Plans:', plansRes.data.data?.length);
        if (plansRes.status !== 200 || plansRes.data.data?.length === 0) throw new Error('List plans failed');

        // 4. Authenticate Admin
        console.log('\n3️⃣ Authenticating Admin...');
        const adminLogin = await apiRequest('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'p7admin@testagency.com', password: 'Admin@123456' })
        });
        if (adminLogin.status !== 200 || !adminLogin.data.data?.token) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
        const adminToken = adminLogin.data.data.token;
        console.log('   ✓ Admin JWT token obtained.');

        // 5. GET Current Agency Subscription & Usage
        console.log('\n4️⃣ Testing GET /api/admin/subscription...');
        const currentSub = await apiRequest('/admin/subscription', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', currentSub.status, '| Active Subscription:', currentSub.data.data?.subscription?.plan_name || 'None', '| Candidates Count:', currentSub.data.data?.usage?.candidates_count);
        if (currentSub.status !== 200) throw new Error('Get agency subscription failed');

        // 6. POST Initialize Checkout
        console.log('\n5️⃣ Testing POST /api/admin/subscription/checkout (Chapa)...');
        const checkoutRes = await apiRequest('/admin/subscription/checkout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                plan_id: planId,
                billing_cycle: 'monthly',
                payment_provider: 'chapa'
            })
        });
        console.log('   Status:', checkoutRes.status, '| tx_ref:', checkoutRes.data.data?.tx_ref, '| Checkout URL:', checkoutRes.data.data?.checkout_url);
        if (checkoutRes.status !== 201 || !checkoutRes.data.data?.tx_ref) throw new Error(`Checkout failed: ${JSON.stringify(checkoutRes.data)}`);
        const txRef = checkoutRes.data.data.tx_ref;

        // 7. POST Verify Payment Reference
        console.log(`\n6️⃣ Testing POST /api/admin/subscription/verify (tx_ref: ${txRef})...`);
        const verifyRes = await apiRequest('/admin/subscription/verify', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                tx_ref: txRef,
                provider: 'chapa'
            })
        });
        console.log('   Status:', verifyRes.status, '| Subscription Status:', verifyRes.data.data?.subscription?.status);
        if (verifyRes.status !== 200 || verifyRes.data.data?.subscription?.status !== 'active') throw new Error(`Verify payment failed: ${JSON.stringify(verifyRes.data)}`);

        // 8. GET Agency Invoices
        console.log('\n7️⃣ Testing GET /api/admin/subscription/invoices...');
        const invoicesRes = await apiRequest('/admin/subscription/invoices', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', invoicesRes.status, '| Total Invoices:', invoicesRes.data.data?.length, '| Latest Invoice Status:', invoicesRes.data.data[0]?.status);
        if (invoicesRes.status !== 200 || invoicesRes.data.data[0]?.status !== 'paid') throw new Error('Get invoices failed');

        // 9. GET Agency Transactions
        console.log('\n8️⃣ Testing GET /api/admin/subscription/transactions...');
        const txsRes = await apiRequest('/admin/subscription/transactions', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', txsRes.status, '| Total Transactions:', txsRes.data.data?.length, '| Transaction Status:', txsRes.data.data[0]?.status);
        if (txsRes.status !== 200 || txsRes.data.data[0]?.status !== 'completed') throw new Error('Get transactions failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 7 INTEGRATION TESTS PASSED SUCCESSFULLY!');
        console.log('====================================================\n');

    } catch (err) {
        console.error('\n❌ Test Execution Failed:', err.message);
        process.exitCode = 1;
    } finally {
        if (server) server.close();
        await db.pool.end();
    }
}

runTests();

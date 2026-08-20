const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 1 Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('11111111-1111-4111-8111-111111111111', 'Test Recruitment Agency', 'test-agency', 'info@testagency.com', '+251911000000', true, true)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('22222222-2222-4222-8222-222222222222', $1, 'Super', 'Admin', 'admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
            [agencyId, adminPasswordHash]
        );

        // 2. Start HTTP server
        server = app.listen(PORT);
        console.log(`✓ Test HTTP server listening on port ${PORT}\n`);

        // Helper fetch wrapper with correct header merging
        async function apiRequest(endpoint, options = {}) {
            const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
            const res = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            const data = await res.json();
            return { status: res.status, data };
        }

        // Test 1: Health Check
        console.log('2️⃣ Testing GET /api/health...');
        const health = await apiRequest('/health');
        console.log('   Status:', health.status, '| Response:', health.data.status);
        if (health.status !== 200) throw new Error('Health check failed');

        // Test 2: Admin Login
        console.log('\n3️⃣ Testing POST /api/admin/auth/login...');
        const adminLogin = await apiRequest('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'admin@testagency.com', password: 'Admin@123456' })
        });
        console.log('   Status:', adminLogin.status, '| Success:', adminLogin.data.success);
        if (adminLogin.status !== 200 || !adminLogin.data.data.token) throw new Error('Admin login failed');
        const adminToken = adminLogin.data.data.token;
        console.log('   ✓ Admin JWT generated for agency:', adminLogin.data.data.admin.agency_name);

        // Test 3: Get Admin Profile
        console.log('\n4️⃣ Testing GET /api/admin/auth/me...');
        const adminMe = await apiRequest('/admin/auth/me', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', adminMe.status, '| Role:', adminMe.data.data.admin.role);
        if (adminMe.status !== 200) throw new Error('Get admin profile failed');

        // Test 4: User Registration
        const testPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
        console.log(`\n5️⃣ Testing POST /api/auth/register with phone ${testPhone}...`);
        const regRes = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                first_name: 'Abebe',
                last_name: 'Bikila',
                phone: testPhone,
                password: 'User@123456',
                preferred_mode: 'job_seeker'
            })
        });
        console.log('   Status:', regRes.status, '| Message:', regRes.data.message);
        if (regRes.status !== 201) throw new Error('User registration failed');

        // Fetch generated OTP from DB
        const otpRow = await db.query(
            'SELECT otp_code FROM otp_verifications WHERE identifier = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1',
            [testPhone, 'registration']
        );
        const otpCode = otpRow.rows[0].otp_code;
        console.log('   ✓ OTP Code retrieved from DB:', otpCode);

        // Test 5: Verify OTP
        console.log('\n6️⃣ Testing POST /api/auth/otp/verify...');
        const verifyRes = await apiRequest('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify({ phone: testPhone, otp_code: otpCode, purpose: 'registration' })
        });
        console.log('   Status:', verifyRes.status, '| Message:', verifyRes.data.message);
        if (verifyRes.status !== 200) throw new Error('OTP verification failed');

        // Test 6: User Login
        console.log('\n7️⃣ Testing POST /api/auth/login...');
        const loginRes = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone: testPhone, password: 'User@123456' })
        });
        console.log('   Status:', loginRes.status, '| Mode:', loginRes.data.data.user.preferred_mode);
        if (loginRes.status !== 200 || !loginRes.data.data.token) throw new Error('User login failed');
        const userToken = loginRes.data.data.token;

        // Test 7: Get User Profile
        console.log('\n8️⃣ Testing GET /api/users/me...');
        const userMe = await apiRequest('/users/me', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', userMe.status, '| User:', `${userMe.data.data.user.first_name} ${userMe.data.data.user.last_name}`);
        if (userMe.status !== 200) throw new Error('Get user profile failed');

        // Test 8: Switch User Mode
        console.log('\n9️⃣ Testing PUT /api/auth/mode (Switching to employer)...');
        const switchRes = await apiRequest('/auth/mode', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ mode: 'employer' })
        });
        console.log('   Status:', switchRes.status, '| New Mode:', switchRes.data.data.mode);
        if (switchRes.status !== 200 || switchRes.data.data.mode !== 'employer') throw new Error('Switch mode failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 1 INTEGRATION TESTS PASSED SUCCESSFULLY!');
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

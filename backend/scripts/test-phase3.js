const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5003;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 3 Candidate Discovery Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('55555555-5555-4555-8555-555555555555', 'Discovery Agency Phase3', 'test-agency-p3', 'p3@testagency.com', '+251911888888', true, true)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('66666666-6666-4666-8666-666666666666', $1, 'Super', 'Admin', 'p3admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
            [agencyId, adminPasswordHash]
        );

        // Ensure test user exists
        const userPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
        const userPassHash = await bcrypt.hash('User@123456', 10);
        const userRes = await db.query(
            `INSERT INTO users (first_name, last_name, phone, password_hash, preferred_mode, phone_verified)
       VALUES ('Dawit', 'Kebede', $1, $2, 'employer', true)
       RETURNING id`,
            [userPhone, userPassHash]
        );
        const userId = userRes.rows[0].id;

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

        // 3. User Login
        console.log('2️⃣ User Login for authentication token...');
        const userLogin = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone: userPhone, password: 'User@123456' })
        });
        if (userLogin.status !== 200 || !userLogin.data.data.token) throw new Error(`User login failed: ${JSON.stringify(userLogin.data)}`);
        const userToken = userLogin.data.data.token;
        console.log('   ✓ User JWT obtained.');

        // 4. Admin Login & Create Candidate
        console.log('\n3️⃣ Admin Login & Candidate Creation...');
        const adminLogin = await apiRequest('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'p3admin@testagency.com', password: 'Admin@123456' })
        });
        const adminToken = adminLogin.data.data.token;

        const candRes = await apiRequest('/admin/candidates', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                first_name: 'Meseret',
                last_name: 'Defar',
                date_of_birth: '1996-03-10',
                gender: 'female',
                nationality: 'Ethiopian',
                religion: 'Christian',
                current_country: 'Ethiopia',
                city: 'Addis Ababa',
                summary: 'Professional nanny and housekeeper.',
                years_of_experience: 3,
                passport_number: 'EP9998887'
            })
        });
        const candidateId = candRes.data.data.id;

        // Set candidate active & featured
        await apiRequest(`/admin/candidates/${candidateId}/active`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ is_active: true })
        });
        await apiRequest(`/admin/candidates/${candidateId}/featured`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ is_featured: true })
        });
        console.log('   ✓ Active & Featured candidate created:', candidateId);

        // 5. Test Categories Catalog
        console.log('\n4️⃣ Testing GET /api/categories...');
        const catRes = await apiRequest('/categories');
        console.log('   Status:', catRes.status, '| Data:', JSON.stringify(catRes.data));
        if (catRes.status !== 200 || !Array.isArray(catRes.data.data)) throw new Error(`Categories fetch failed: ${JSON.stringify(catRes.data)}`);

        // 6. Test Agencies Catalog
        console.log('\n5️⃣ Testing GET /api/agencies...');
        const agencyRes = await apiRequest('/agencies');
        console.log('   Status:', agencyRes.status, '| Total Agencies:', agencyRes.data.data?.length);
        if (agencyRes.status !== 200 || !Array.isArray(agencyRes.data.data)) throw new Error('Agencies fetch failed');

        // 7. Test Public Candidates Listing
        console.log('\n6️⃣ Testing GET /api/candidates?search=Meseret...');
        const pubListRes = await apiRequest('/candidates?search=Meseret');
        console.log('   Status:', pubListRes.status, '| Total Items:', pubListRes.data.meta?.totalItems);
        if (pubListRes.status !== 200 || !Array.isArray(pubListRes.data.data)) throw new Error('Public candidate search failed');

        // 8. Test Featured Candidates
        console.log('\n7️⃣ Testing GET /api/candidates/featured...');
        const featRes = await apiRequest('/candidates/featured');
        console.log('   Status:', featRes.status, '| Featured Count:', featRes.data.data?.length);
        if (featRes.status !== 200 || !Array.isArray(featRes.data.data)) throw new Error('Featured candidates failed');

        // 9. Test Get Public Candidate Detail
        console.log(`\n8️⃣ Testing GET /api/candidates/${candidateId}...`);
        const detailRes = await apiRequest(`/candidates/${candidateId}`);
        console.log('   Status:', detailRes.status, '| View Count:', detailRes.data.data?.view_count);
        if (detailRes.status !== 200 || !detailRes.data.data) throw new Error('Public candidate detail failed');

        // 10. Submit Candidate Inquiry
        console.log(`\n9️⃣ Testing POST /api/candidates/${candidateId}/inquiry...`);
        const inqRes = await apiRequest(`/candidates/${candidateId}/inquiry`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({
                employer_name: 'Dawit Kebede',
                employer_phone: userPhone,
                employer_email: 'dawit@example.com',
                message: 'Interested in hiring Meseret for housemaid contract.'
            })
        });
        console.log('   Status:', inqRes.status, '| Message:', inqRes.data.message);
        if (inqRes.status !== 201 || !inqRes.data.data?.id) throw new Error('Submit inquiry failed');

        // 11. Get User Inquiries
        console.log('\n🔟 Testing GET /api/users/me/inquiries...');
        const userInqRes = await apiRequest('/users/me/inquiries', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', userInqRes.status, '| User Inquiries Count:', userInqRes.data.data?.length);
        if (userInqRes.status !== 200 || !Array.isArray(userInqRes.data.data)) throw new Error('Get user inquiries failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 3 INTEGRATION TESTS PASSED SUCCESSFULLY!');
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

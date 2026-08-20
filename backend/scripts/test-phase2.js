const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5002;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 2 Candidate Management Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('33333333-3333-4333-8333-333333333333', 'Test Agency Phase2', 'test-agency-p2', 'p2@testagency.com', '+251911999999', true, true)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('44444444-4444-4444-8444-444444444444', $1, 'Super', 'Admin', 'p2admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
            [agencyId, adminPasswordHash]
        );

        // Get a category ID from seeds
        const catRes = await db.query('SELECT id FROM categories LIMIT 1');
        const categoryId = catRes.rows[0].id;

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

        // 3. Admin Login
        console.log('2️⃣ Admin Login for authentication token...');
        const loginRes = await apiRequest('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'p2admin@testagency.com', password: 'Admin@123456' })
        });
        if (loginRes.status !== 200 || !loginRes.data.data.token) throw new Error('Admin login failed');
        const adminToken = loginRes.data.data.token;
        console.log('   ✓ Admin JWT obtained.');

        // 4. Create Candidate
        console.log('\n3️⃣ Testing POST /api/admin/candidates...');
        const createRes = await apiRequest('/admin/candidates', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                first_name: 'Tigist',
                last_name: 'Haile',
                date_of_birth: '1998-05-14',
                gender: 'female',
                nationality: 'Ethiopian',
                religion: 'Christian',
                current_country: 'Ethiopia',
                city: 'Addis Ababa',
                summary: 'Experienced housemaid with 4 years in Dubai.',
                education_level: 'secondary',
                years_of_experience: 4,
                passport_number: 'EP1234567',
                category_ids: [categoryId],
                skills: [{ skill_name: 'Housekeeping', proficiency_level: 'expert', years_experience: 4 }],
                languages: [{ language: 'Arabic', proficiency: 'conversational' }]
            })
        });
        console.log('   Status:', createRes.status, '| Candidate ID:', createRes.data.data?.id);
        if (createRes.status !== 201 || !createRes.data.data?.id) throw new Error('Create candidate failed');
        const candidateId = createRes.data.data.id;

        // 5. Get Candidate List
        console.log('\n4️⃣ Testing GET /api/admin/candidates...');
        const listRes = await apiRequest('/admin/candidates?search=Tigist', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', listRes.status, '| Total Candidates:', listRes.data.meta.totalItems);
        if (listRes.status !== 200 || listRes.data.data.length === 0) throw new Error('List candidates failed');

        // 6. Get Candidate Details
        console.log(`\n5️⃣ Testing GET /api/admin/candidates/${candidateId}...`);
        const detailRes = await apiRequest(`/admin/candidates/${candidateId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', detailRes.status, '| Skills:', detailRes.data.data.skills.length, '| Languages:', detailRes.data.data.languages.length);
        if (detailRes.status !== 200 || detailRes.data.data.first_name !== 'Tigist') throw new Error('Get candidate details failed');

        // 7. Update Candidate
        console.log(`\n6️⃣ Testing PUT /api/admin/candidates/${candidateId}...`);
        const updateRes = await apiRequest(`/admin/candidates/${candidateId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ summary: 'Updated summary: Expert in Cooking & Housekeeping' })
        });
        console.log('   Status:', updateRes.status, '| Updated Summary:', updateRes.data.data.summary);
        if (updateRes.status !== 200) throw new Error('Update candidate failed');

        // 8. Update Medical Status
        console.log(`\n7️⃣ Testing PATCH /api/admin/candidates/${candidateId}/medical...`);
        const medRes = await apiRequest(`/admin/candidates/${candidateId}/medical`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ status: 'cleared', clearance_date: '2026-08-20' })
        });
        console.log('   Status:', medRes.status, '| Medical Status:', medRes.data.data.medical_clearance_status);
        if (medRes.status !== 200 || medRes.data.data.medical_clearance_status !== 'cleared') throw new Error('Medical update failed');

        // 9. Toggle Featured
        console.log(`\n8️⃣ Testing PATCH /api/admin/candidates/${candidateId}/featured...`);
        const featRes = await apiRequest(`/admin/candidates/${candidateId}/featured`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ is_featured: true })
        });
        console.log('   Status:', featRes.status, '| Is Featured:', featRes.data.data.is_featured);
        if (featRes.status !== 200 || !featRes.data.data.is_featured) throw new Error('Toggle featured failed');

        // 10. Delete Candidate
        console.log(`\n9️⃣ Testing DELETE /api/admin/candidates/${candidateId}...`);
        const delRes = await apiRequest(`/admin/candidates/${candidateId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', delRes.status, '| Message:', delRes.data.message);
        if (delRes.status !== 200) throw new Error('Delete candidate failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 2 INTEGRATION TESTS PASSED SUCCESSFULLY!');
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

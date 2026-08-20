const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5005;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 5 Hiring Pipeline Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('99999999-9999-4999-8999-999999999999', 'Pipeline Agency Phase5', 'test-agency-p5', 'p5@testagency.com', '+251911999999', true, true)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        const adminRes = await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', $1, 'Super', 'Admin', 'p5admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, agency_id = EXCLUDED.agency_id
       RETURNING id`,
            [agencyId, adminPasswordHash]
        );
        const adminId = adminRes.rows[0].id;

        // Ensure test user exists
        const userPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
        const userPassHash = await bcrypt.hash('User@123456', 10);
        const userRes = await db.query(
            `INSERT INTO users (first_name, last_name, phone, password_hash, preferred_mode, phone_verified)
       VALUES ('Tilahun', 'Gessesse', $1, $2, 'employer', true)
       RETURNING id`,
            [userPhone, userPassHash]
        );
        const userId = userRes.rows[0].id;

        // Ensure test candidate exists
        const candRes = await db.query(
            `INSERT INTO candidates (agency_id, uploaded_by, first_name, last_name, date_of_birth, gender, nationality, religion, current_country, city, summary, is_active)
       VALUES ($1, $2, 'Aster', 'Aweke', '1998-05-15', 'female', 'Ethiopian', 'Christian', 'Ethiopia', 'Addis Ababa', 'Experienced caregiver', true)
       RETURNING id`,
            [agencyId, adminId]
        );
        const candidateId = candRes.rows[0].id;

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

        // 3. Authenticate Admin & User
        console.log('2️⃣ Authenticating Admin & User...');
        const adminLogin = await apiRequest('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'p5admin@testagency.com', password: 'Admin@123456' })
        });
        if (adminLogin.status !== 200 || !adminLogin.data.data?.token) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
        const adminToken = adminLogin.data.data.token;

        const userLogin = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone: userPhone, password: 'User@123456' })
        });
        if (userLogin.status !== 200 || !userLogin.data.data?.token) throw new Error(`User login failed: ${JSON.stringify(userLogin.data)}`);
        const userToken = userLogin.data.data.token;
        console.log('   ✓ Admin & User JWT tokens obtained.');

        // 4. Initialize Pipeline
        console.log('\n3️⃣ Testing POST /api/admin/pipelines...');
        const createPipe = await apiRequest('/admin/pipelines', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                candidate_id: candidateId,
                employer_user_id: userId,
                employer_name: 'Tilahun Gessesse',
                employer_country: 'United Arab Emirates',
                employer_city: 'Dubai',
                current_stage: 'interviewing',
                notes: 'Interview passed successfully for Dubai placement.'
            })
        });
        console.log('   Status:', createPipe.status, '| Pipeline ID:', createPipe.data.data?.id);
        if (createPipe.status !== 201 || !createPipe.data.data?.id) throw new Error(`Create pipeline failed: ${JSON.stringify(createPipe.data)}`);
        const pipelineId = createPipe.data.data.id;

        // 5. Admin List Pipelines
        console.log('\n4️⃣ Testing GET /api/admin/pipelines...');
        const listPipe = await apiRequest('/admin/pipelines', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', listPipe.status, '| Total Pipelines:', listPipe.data.meta?.totalItems);
        if (listPipe.status !== 200 || listPipe.data.data?.length === 0) throw new Error('List pipelines failed');

        // 6. Admin Get Pipeline Detail View
        console.log(`\n5️⃣ Testing GET /api/admin/pipelines/${pipelineId}...`);
        const detailPipe = await apiRequest(`/admin/pipelines/${pipelineId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', detailPipe.status, '| Stage History Items:', detailPipe.data.data?.stage_history?.length);
        if (detailPipe.status !== 200 || !detailPipe.data.data) throw new Error('Pipeline detail failed');

        // 7. Advance Stage: medical_biometrics
        console.log(`\n6️⃣ Testing PATCH /api/admin/pipelines/${pipelineId}/stage (medical_biometrics)...`);
        const stage1 = await apiRequest(`/admin/pipelines/${pipelineId}/stage`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ stage: 'medical_biometrics', notes: 'FIT medical report received.' })
        });
        console.log('   Status:', stage1.status, '| Current Stage:', stage1.data.data?.current_stage);
        if (stage1.status !== 200 || stage1.data.data?.current_stage !== 'medical_biometrics') throw new Error('Stage transition failed');

        // 8. Advance Stage: visa_processing
        console.log(`\n7️⃣ Testing PATCH /api/admin/pipelines/${pipelineId}/stage (visa_processing)...`);
        const stage2 = await apiRequest(`/admin/pipelines/${pipelineId}/stage`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ stage: 'visa_processing', notes: 'Visa application submitted to UAE embassy.' })
        });
        console.log('   Status:', stage2.status, '| Current Stage:', stage2.data.data?.current_stage);
        if (stage2.status !== 200 || stage2.data.data?.current_stage !== 'visa_processing') throw new Error('Stage transition failed');

        // 9. Upload Pipeline Document
        console.log(`\n8️⃣ Testing POST /api/admin/pipelines/${pipelineId}/documents...`);
        const docRes = await apiRequest(`/admin/pipelines/${pipelineId}/documents`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                document_type: 'visa',
                document_name: 'UAE Work Visa Entry Permit.pdf',
                document_url: 'https://s3.amazonaws.com/maid-app/documents/uae_visa_aster.pdf',
                notes: 'Approved 2-year entry visa.'
            })
        });
        console.log('   Status:', docRes.status, '| Document ID:', docRes.data.data?.id);
        if (docRes.status !== 201 || !docRes.data.data?.id) throw new Error(`Upload document failed: ${JSON.stringify(docRes.data)}`);

        // 10. Advance Stage: deployed
        console.log(`\n9️⃣ Testing PATCH /api/admin/pipelines/${pipelineId}/stage (deployed)...`);
        const stage3 = await apiRequest(`/admin/pipelines/${pipelineId}/stage`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ stage: 'deployed', notes: 'Flight arrived in Dubai. Employer received candidate.' })
        });
        console.log('   Status:', stage3.status, '| Current Stage:', stage3.data.data?.current_stage);
        if (stage3.status !== 200 || stage3.data.data?.current_stage !== 'deployed') throw new Error('Stage transition failed');

        // 11. Finalize Outcome: successful
        console.log(`\n🔟 Testing PATCH /api/admin/pipelines/${pipelineId}/outcome (successful)...`);
        const outcomeRes = await apiRequest(`/admin/pipelines/${pipelineId}/outcome`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ outcome: 'successful', outcome_notes: 'Successful placement completed.' })
        });
        console.log('   Status:', outcomeRes.status, '| Outcome:', outcomeRes.data.data?.outcome);
        if (outcomeRes.status !== 200 || outcomeRes.data.data?.outcome !== 'successful') throw new Error('Update outcome failed');

        // 12. User Get Pipelines
        console.log('\n1️⃣1️⃣ Testing GET /api/users/me/pipelines...');
        const userPipes = await apiRequest('/users/me/pipelines', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', userPipes.status, '| Pipelines Count:', userPipes.data.data?.length);
        if (userPipes.status !== 200 || userPipes.data.data?.length === 0) throw new Error('User get pipelines failed');

        // 13. User Get Pipeline Detail Timeline
        console.log(`\n1️⃣2️⃣ Testing GET /api/users/me/pipelines/${pipelineId}...`);
        const userPipeDetail = await apiRequest(`/users/me/pipelines/${pipelineId}`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', userPipeDetail.status, '| Timeline Stages:', userPipeDetail.data.data?.stage_history?.length, '| Docs:', userPipeDetail.data.data?.documents?.length);
        if (userPipeDetail.status !== 200 || userPipeDetail.data.data?.stage_history?.length !== 4) throw new Error('User pipeline timeline failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 5 INTEGRATION TESTS PASSED SUCCESSFULLY!');
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

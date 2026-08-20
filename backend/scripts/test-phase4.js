const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5004;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 4 Job Vacancies & Applications Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('77777777-7777-4777-8777-777777777777', 'Vacancy Agency Phase4', 'test-agency-p4', 'p4@testagency.com', '+251911777777', true, true)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        const adminRes = await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('88888888-8888-4888-8888-888888888888', $1, 'Super', 'Admin', 'p4admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, agency_id = EXCLUDED.agency_id
       RETURNING id`,
            [agencyId, adminPasswordHash]
        );

        // Ensure test user exists
        const userPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
        const userPassHash = await bcrypt.hash('User@123456', 10);
        const userRes = await db.query(
            `INSERT INTO users (first_name, last_name, phone, password_hash, preferred_mode, phone_verified)
       VALUES ('Abebe', 'Bikila', $1, $2, 'job_seeker', true)
       RETURNING id`,
            [userPhone, userPassHash]
        );

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
            body: JSON.stringify({ email: 'p4admin@testagency.com', password: 'Admin@123456' })
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

        // 4. Create Job Vacancy
        console.log('\n3️⃣ Testing POST /api/admin/vacancies...');
        const createVac = await apiRequest('/admin/vacancies', {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({
                title: 'Senior Housekeeper / Cook',
                description: 'Full time housekeeping and traditional cooking for VIP family in Riyadh.',
                requirements: 'Minimum 2 years experience in Gulf region.',
                benefits: 'Free accommodation, medical insurance, return ticket.',
                destination_country: 'Saudi Arabia',
                city: 'Riyadh',
                salary_min: 1500,
                salary_max: 1800,
                salary_currency: 'SAR',
                contract_duration_months: 24,
                contract_type: 'full_time',
                working_hours_per_day: 8,
                working_days_per_week: 6,
                visa_sponsorship: true,
                accommodation_provided: true,
                meals_provided: true,
                gender_preference: 'female',
                experience_required_years: 2,
                positions_available: 3,
                status: 'draft',
                is_featured: true,
                skills_required: [{ skill_name: 'Arabic Cooking', is_required: true }, { skill_name: 'Ironing', is_required: false }],
                languages_required: [{ language: 'Arabic', proficiency_required: 'conversational', is_required: true }]
            })
        });
        console.log('   Status:', createVac.status, '| Vacancy ID:', createVac.data.data?.id);
        if (createVac.status !== 201 || !createVac.data.data?.id) throw new Error(`Create vacancy failed: ${JSON.stringify(createVac.data)}`);
        const vacancyId = createVac.data.data.id;

        // 5. Update Vacancy Status to Active
        console.log(`\n4️⃣ Testing PATCH /api/admin/vacancies/${vacancyId}/status...`);
        const statusRes = await apiRequest(`/admin/vacancies/${vacancyId}/status`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ status: 'active' })
        });
        console.log('   Status:', statusRes.status, '| New Vacancy Status:', statusRes.data.data?.status);
        if (statusRes.status !== 200 || statusRes.data.data?.status !== 'active') throw new Error('Update status failed');

        // 6. Public Search Vacancies
        console.log('\n5️⃣ Testing GET /api/vacancies?destination_country=Saudi...');
        const pubVacRes = await apiRequest('/vacancies?destination_country=Saudi');
        console.log('   Status:', pubVacRes.status, '| Total Items:', pubVacRes.data.meta?.totalItems);
        if (pubVacRes.status !== 200 || pubVacRes.data.data?.length === 0) throw new Error('Public search vacancies failed');

        // 7. Featured Vacancies
        console.log('\n6️⃣ Testing GET /api/vacancies/featured...');
        const featVacRes = await apiRequest('/vacancies/featured');
        console.log('   Status:', featVacRes.status, '| Featured Count:', featVacRes.data.data?.length);
        if (featVacRes.status !== 200 || featVacRes.data.data?.length === 0) throw new Error('Featured vacancies failed');

        // 8. Public Vacancy Detail View
        console.log(`\n7️⃣ Testing GET /api/vacancies/${vacancyId}...`);
        const detailVacRes = await apiRequest(`/vacancies/${vacancyId}`);
        console.log('   Status:', detailVacRes.status, '| View Count:', detailVacRes.data.data?.view_count);
        if (detailVacRes.status !== 200 || detailVacRes.data.data?.view_count < 1) throw new Error('Public vacancy detail failed');

        // 9. User Apply for Vacancy
        console.log(`\n8️⃣ Testing POST /api/vacancies/${vacancyId}/apply...`);
        const applyRes = await apiRequest(`/vacancies/${vacancyId}/apply`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({
                cover_letter: 'I have 3 years experience working in Dubai as a cook and housekeeper.'
            })
        });
        console.log('   Status:', applyRes.status, '| Application ID:', applyRes.data.data?.id);
        if (applyRes.status !== 201 || !applyRes.data.data?.id) throw new Error(`Apply for vacancy failed: ${JSON.stringify(applyRes.data)}`);
        const applicationId = applyRes.data.data.id;

        // 10. Admin List Vacancy Applications
        console.log(`\n9️⃣ Testing GET /api/admin/vacancies/${vacancyId}/applications...`);
        const adminAppsRes = await apiRequest(`/admin/vacancies/${vacancyId}/applications`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', adminAppsRes.status, '| Applications Count:', adminAppsRes.data.data?.length);
        if (adminAppsRes.status !== 200 || adminAppsRes.data.data?.length === 0) throw new Error('Admin list applications failed');

        // 11. Admin Update Application Status to Shortlisted
        console.log(`\n🔟 Testing PATCH /api/admin/vacancies/applications/${applicationId}/status...`);
        const updateAppRes = await apiRequest(`/admin/vacancies/applications/${applicationId}/status`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ status: 'shortlisted', reviewer_notes: 'Strong candidate with Arabic language skills.' })
        });
        console.log('   Status:', updateAppRes.status, '| New App Status:', updateAppRes.data.data?.status);
        if (updateAppRes.status !== 200 || updateAppRes.data.data?.status !== 'shortlisted') throw new Error('Update application status failed');

        // 12. User Get Job Applications History
        console.log('\n1️⃣1️⃣ Testing GET /api/users/me/applications...');
        const userAppsRes = await apiRequest('/users/me/applications', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', userAppsRes.status, '| Application Status in History:', userAppsRes.data.data[0]?.status);
        if (userAppsRes.status !== 200 || userAppsRes.data.data[0]?.status !== 'shortlisted') throw new Error('User applications history failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 4 INTEGRATION TESTS PASSED SUCCESSFULLY!');
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

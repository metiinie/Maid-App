const bcrypt = require('bcryptjs');
const db = require('../src/config/db');
const runMigrations = require('../src/db/migrate');
const app = require('../src/server');

let server;
const PORT = 5006;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
    console.log('🧪 Starting Phase 6 Communication & Notifications Integration Tests...\n');

    try {
        // 1. Run migrations & seeds
        console.log('1️⃣ Running Database Migrations & Seeds...');
        await runMigrations();

        // Ensure test agency exists
        const agencyResult = await db.query(
            `INSERT INTO agencies (id, name, slug, email, phone, is_active, is_verified)
       VALUES ('88888888-8888-4888-8888-888888888888', 'Messaging Agency Phase6', 'test-agency-p6', 'p6@testagency.com', '+251911888888', true, true)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
        );
        const agencyId = agencyResult.rows[0].id;

        // Ensure test admin exists
        const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
        await db.query(
            `INSERT INTO admin_users (id, agency_id, first_name, last_name, email, password_hash, role, is_active)
       VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', $1, 'Chat', 'Admin', 'p6admin@testagency.com', $2, 'super_admin', true)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, agency_id = EXCLUDED.agency_id`,
            [agencyId, adminPasswordHash]
        );

        // Ensure test user exists
        const userPhone = `+2519${Math.floor(10000000 + Math.random() * 90000000)}`;
        const userPassHash = await bcrypt.hash('User@123456', 10);
        const userRes = await db.query(
            `INSERT INTO users (first_name, last_name, phone, password_hash, preferred_mode, phone_verified)
       VALUES ('Abebe', 'Bikila', $1, $2, 'employer', true)
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

        // 3. Authenticate Admin & User
        console.log('2️⃣ Authenticating Admin & User...');
        const adminLogin = await apiRequest('/admin/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'p6admin@testagency.com', password: 'Admin@123456' })
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

        // 4. User Create/Get Conversation
        console.log('\n3️⃣ Testing POST /api/conversations...');
        const createConv = await apiRequest('/conversations', {
            method: 'POST',
            headers: { Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ agency_id: agencyId, context_type: 'candidate_inquiry' })
        });
        console.log('   Status:', createConv.status, '| Conversation ID:', createConv.data.data?.id);
        if (createConv.status !== 201 && createConv.status !== 200) throw new Error(`Create conversation failed: ${JSON.stringify(createConv.data)}`);
        const convId = createConv.data.data.id;

        // 5. User List Conversations
        console.log('\n4️⃣ Testing GET /api/conversations...');
        const listUserConv = await apiRequest('/conversations', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', listUserConv.status, '| Total Conversations:', listUserConv.data.data?.length);
        if (listUserConv.status !== 200 || listUserConv.data.data?.length === 0) throw new Error('List user conversations failed');

        // 6. User Send Message
        console.log(`\n5️⃣ Testing POST /api/conversations/${convId}/messages (User)...`);
        const sendUserMsg = await apiRequest(`/conversations/${convId}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${userToken}` },
            body: JSON.stringify({ message_text: 'Hello, I would like to inquire about candidate profiles for Dubai.' })
        });
        console.log('   Status:', sendUserMsg.status, '| Message ID:', sendUserMsg.data.data?.id);
        if (sendUserMsg.status !== 201 || !sendUserMsg.data.data?.id) throw new Error(`Send user message failed: ${JSON.stringify(sendUserMsg.data)}`);

        // 7. Admin List Conversations
        console.log('\n6️⃣ Testing GET /api/admin/conversations...');
        const listAdminConv = await apiRequest('/admin/conversations', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', listAdminConv.status, '| Unread Count for Admin:', listAdminConv.data.data[0]?.admin_unread_count);
        if (listAdminConv.status !== 200 || listAdminConv.data.data[0]?.admin_unread_count < 1) throw new Error('Admin list conversations failed');

        // 8. Admin View Messages History
        console.log(`\n7️⃣ Testing GET /api/admin/conversations/${convId}/messages...`);
        const adminMsgs = await apiRequest(`/admin/conversations/${convId}/messages`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('   Status:', adminMsgs.status, '| Messages Received:', adminMsgs.data.data?.length);
        if (adminMsgs.status !== 200 || adminMsgs.data.data?.length === 0) throw new Error('Admin get messages failed');

        // 9. Admin Send Response Message
        console.log(`\n8️⃣ Testing POST /api/admin/conversations/${convId}/messages (Admin)...`);
        const sendAdminMsg = await apiRequest(`/admin/conversations/${convId}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` },
            body: JSON.stringify({ message_text: 'Greetings Abebe! We have top verified candidates available for deployment to Dubai.' })
        });
        console.log('   Status:', sendAdminMsg.status, '| Message ID:', sendAdminMsg.data.data?.id);
        if (sendAdminMsg.status !== 201 || !sendAdminMsg.data.data?.id) throw new Error(`Send admin message failed: ${JSON.stringify(sendAdminMsg.data)}`);

        // 10. User Check Notifications
        console.log('\n9️⃣ Testing GET /api/notifications...');
        const userNotifs = await apiRequest('/notifications', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', userNotifs.status, '| Total Notifications:', userNotifs.data.meta?.totalItems);
        if (userNotifs.status !== 200 || userNotifs.data.data?.length === 0) throw new Error('Get notifications failed');
        const notifId = userNotifs.data.data[0].id;

        // 11. User Get Unread Notifications Count
        console.log('\n🔟 Testing GET /api/notifications/unread-count...');
        const unreadCount = await apiRequest('/notifications/unread-count', {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', unreadCount.status, '| Unread Count:', unreadCount.data.data?.unread_count);
        if (unreadCount.status !== 200 || unreadCount.data.data?.unread_count < 1) throw new Error('Get unread count failed');

        // 12. User Mark Notification Read
        console.log(`\n1️⃣1️⃣ Testing PATCH /api/notifications/${notifId}/read...`);
        const markRead = await apiRequest(`/notifications/${notifId}/read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('   Status:', markRead.status, '| Is Read:', markRead.data.data?.is_read);
        if (markRead.status !== 200 || !markRead.data.data?.is_read) throw new Error('Mark notification read failed');

        console.log('\n====================================================');
        console.log('🎉 ALL PHASE 6 INTEGRATION TESTS PASSED SUCCESSFULLY!');
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

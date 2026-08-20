const admin = require('firebase-admin');
const db = require('../config/db');

let firebaseAdmin = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== 'mock-firebase-project') {
    try {
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL
            })
        });
    } catch (err) {
        console.warn('⚠️ Failed to initialize Firebase Admin SDK, fallback to mock push notification.');
    }
}

async function sendPushNotification({ token, title, body, data = {} }) {
    if (firebaseAdmin) {
        try {
            const message = {
                token,
                notification: { title, body },
                data: Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)])
                ),
                android: { priority: 'high' },
                apns: { payload: { aps: { sound: 'default' } } }
            };
            await admin.messaging().send(message);
            console.log(`🔔 FCM Push sent to token: ${token.substring(0, 10)}...`);
            return { success: true };
        } catch (err) {
            if (err.code === 'messaging/registration-token-not-registered') {
                await db.query('UPDATE device_tokens SET is_active = false WHERE token = $1', [token]);
            }
            console.error('❌ FCM Push notification failed:', err.message);
            return { success: false, error: err.message };
        }
    } else {
        console.log(`[MOCK FCM PUSH] Token: ${token.substring(0, 15)}... | Title: "${title}" | Body: "${body}"`);
        return { success: true, mock: true };
    }
}

async function sendToUser(userId, { title, body, data = {} }) {
    const { rows } = await db.query(
        'SELECT token FROM device_tokens WHERE user_id = $1 AND is_active = true',
        [userId]
    );

    const results = [];
    for (const row of rows) {
        results.push(await sendPushNotification({ token: row.token, title, body, data }));
    }
    return results;
}

module.exports = { sendPushNotification, sendToUser };

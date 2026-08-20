const crypto = require('crypto');
const db = require('../config/db');
const { sendOTP } = require('./sms.service');

function generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        otp += digits[bytes[i] % 10];
    }
    return otp;
}

async function createAndSendOTP({ phone, purpose, userId = null }) {
    const otpLength = parseInt(process.env.OTP_LENGTH || '6', 10);
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);

    const otpCode = generateOTP(otpLength);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate previous unverified OTPs for this phone + purpose
    await db.query(
        'DELETE FROM otp_verifications WHERE identifier = $1 AND purpose = $2 AND verified_at IS NULL',
        [phone, purpose]
    );

    // Store new OTP record
    await db.query(
        `INSERT INTO otp_verifications
     (identifier, identifier_type, otp_code, purpose, user_id, expires_at)
     VALUES ($1, 'phone', $2, $3, $4, $5)`,
        [phone, otpCode, purpose, userId, expiresAt]
    );

    // Trigger SMS delivery
    await sendOTP({ phone, otp: otpCode, purpose });

    return { success: true, otpCode, expiresAt };
}

async function verifyOTP({ phone, otpCode, purpose }) {
    const { rows } = await db.query(
        `SELECT * FROM otp_verifications
     WHERE identifier = $1 AND purpose = $2 AND verified_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
        [phone, purpose]
    );

    const otpRecord = rows[0];
    if (!otpRecord) {
        return { valid: false, message: 'No active OTP request found for this phone number' };
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
        return { valid: false, message: 'OTP has expired. Please request a new code.' };
    }

    if (otpRecord.attempts >= 5) {
        return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
    }

    if (otpRecord.otp_code !== otpCode) {
        await db.query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1', [otpRecord.id]);
        return { valid: false, message: 'Invalid OTP code' };
    }

    // Mark OTP as verified
    await db.query('UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1', [otpRecord.id]);

    return { valid: true, otpRecord };
}

module.exports = { generateOTP, createAndSendOTP, verifyOTP };

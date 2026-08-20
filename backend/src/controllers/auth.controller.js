const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateUserToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { createAndSendOTP, verifyOTP } = require('../services/otp.service');

// POST /api/auth/register
async function register(req, res) {
    try {
        const { first_name, last_name, phone, password, preferred_mode = 'job_seeker' } = req.body;

        // Check if phone already registered
        const existing = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (existing.rows.length > 0) {
            return errorResponse(res, { statusCode: 400, message: 'Phone number is already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const { rows } = await db.query(
            `INSERT INTO users (first_name, last_name, phone, password_hash, preferred_mode)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, phone, preferred_mode, created_at`,
            [first_name, last_name, phone, password_hash, preferred_mode]
        );

        const user = rows[0];

        // Trigger OTP sending
        await createAndSendOTP({ phone, purpose: 'registration', userId: user.id });

        return successResponse(res, {
            statusCode: 201,
            message: 'Registration successful. OTP code sent to phone.',
            data: { user }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to register user' });
    }
}

// POST /api/auth/otp/send
async function sendOTPCode(req, res) {
    try {
        const { phone, purpose = 'registration' } = req.body;
        await createAndSendOTP({ phone, purpose });
        return successResponse(res, { message: `OTP sent to ${phone}` });
    } catch (err) {
        console.error('Send OTP error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to send OTP' });
    }
}

// POST /api/auth/otp/verify
async function verifyOTPCode(req, res) {
    try {
        const { phone, otp_code, purpose = 'registration' } = req.body;
        const result = await verifyOTP({ phone, otpCode: otp_code, purpose });

        if (!result.valid) {
            return errorResponse(res, { statusCode: 400, message: result.message });
        }

        // Mark phone as verified if purpose is registration
        if (purpose === 'registration') {
            await db.query('UPDATE users SET phone_verified = true WHERE phone = $1', [phone]);
        }

        return successResponse(res, { message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to verify OTP' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    try {
        const { phone, password } = req.body;

        const { rows } = await db.query(
            `SELECT id, first_name, last_name, email, phone, password_hash, preferred_mode, is_active, is_blocked
       FROM users WHERE phone = $1`,
            [phone]
        );

        const user = rows[0];
        if (!user) {
            return errorResponse(res, { statusCode: 401, message: 'Invalid phone number or password' });
        }

        if (!user.is_active || user.is_blocked) {
            return errorResponse(res, { statusCode: 403, message: 'Account disabled or blocked' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return errorResponse(res, { statusCode: 401, message: 'Invalid phone number or password' });
        }

        // Update last login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = generateUserToken(user);
        delete user.password_hash;

        return successResponse(res, {
            message: 'Login successful',
            data: { token, user }
        });
    } catch (err) {
        console.error('User login error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Login failed' });
    }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
    try {
        const { phone } = req.body;
        const { rows } = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'No account found with this phone number' });
        }

        await createAndSendOTP({ phone, purpose: 'password_reset', userId: rows[0].id });
        return successResponse(res, { message: 'Password reset OTP sent to phone' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to process request' });
    }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
    try {
        const { phone, otp_code, new_password } = req.body;

        const result = await verifyOTP({ phone, otpCode: otp_code, purpose: 'password_reset' });
        if (!result.valid) {
            return errorResponse(res, { statusCode: 400, message: result.message });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(new_password, salt);

        await db.query('UPDATE users SET password_hash = $1 WHERE phone = $2', [password_hash, phone]);

        return successResponse(res, { message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to reset password' });
    }
}

// PUT /api/auth/mode
async function switchMode(req, res) {
    try {
        const { mode } = req.body;
        if (!['job_seeker', 'employer'].includes(mode)) {
            return errorResponse(res, { statusCode: 400, message: 'Invalid mode. Must be job_seeker or employer' });
        }

        await db.query('UPDATE users SET preferred_mode = $1 WHERE id = $2', [mode, req.user.id]);
        req.user.preferred_mode = mode;

        const newToken = generateUserToken(req.user);

        return successResponse(res, {
            message: `Switched to ${mode} mode`,
            data: { token: newToken, mode }
        });
    } catch (err) {
        console.error('Switch mode error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to switch mode' });
    }
}

module.exports = {
    register,
    sendOTPCode,
    verifyOTPCode,
    login,
    forgotPassword,
    resetPassword,
    switchMode
};

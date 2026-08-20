const { verifyUserToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const db = require('../config/db');

async function userAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, { statusCode: 401, message: 'Authentication required. Please provide a valid Bearer token.' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = verifyUserToken(token);
        } catch (err) {
            return errorResponse(res, { statusCode: 401, message: 'Invalid or expired token. Please log in again.' });
        }

        if (decoded.type !== 'user') {
            return errorResponse(res, { statusCode: 403, message: 'Access denied. User token required.' });
        }

        const { rows } = await db.query(
            'SELECT id, first_name, last_name, email, phone, preferred_mode, is_active, is_blocked FROM users WHERE id = $1',
            [decoded.id]
        );

        const user = rows[0];
        if (!user) {
            return errorResponse(res, { statusCode: 401, message: 'User account no longer exists.' });
        }

        if (!user.is_active || user.is_blocked) {
            return errorResponse(res, { statusCode: 403, message: 'Your account has been deactivated or suspended.' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('userAuth error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Authentication error' });
    }
}

module.exports = userAuth;

const { verifyAdminToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const db = require('../config/db');

async function adminAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, { statusCode: 401, message: 'Admin authentication required.' });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = verifyAdminToken(token);
        } catch (err) {
            return errorResponse(res, { statusCode: 401, message: 'Invalid or expired admin token.' });
        }

        if (decoded.type !== 'admin') {
            return errorResponse(res, { statusCode: 403, message: 'Access denied. Admin privileges required.' });
        }

        const { rows } = await db.query(
            'SELECT id, agency_id, first_name, last_name, email, role, permissions, is_active FROM admin_users WHERE id = $1',
            [decoded.id]
        );

        const adminUser = rows[0];
        if (!adminUser || !adminUser.is_active) {
            return errorResponse(res, { statusCode: 403, message: 'Admin account is inactive or disabled.' });
        }

        req.admin = adminUser;
        req.agencyId = adminUser.agency_id;
        next();
    } catch (err) {
        console.error('adminAuth error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Admin authentication error' });
    }
}

module.exports = adminAuth;

const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateAdminToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/admin/auth/login
async function adminLogin(req, res) {
    try {
        const { email, password } = req.body;

        const { rows } = await db.query(
            `SELECT a.id, a.agency_id, a.first_name, a.last_name, a.email, a.password_hash, a.role, a.permissions, a.is_active,
              g.name as agency_name, g.slug as agency_slug, g.logo_url as agency_logo
       FROM admin_users a
       JOIN agencies g ON g.id = a.agency_id
       WHERE a.email = $1`,
            [email]
        );

        const admin = rows[0];
        if (!admin) {
            return errorResponse(res, { statusCode: 401, message: 'Invalid admin credentials' });
        }

        if (!admin.is_active) {
            return errorResponse(res, { statusCode: 403, message: 'Admin account is deactivated' });
        }

        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return errorResponse(res, { statusCode: 401, message: 'Invalid admin credentials' });
        }

        // Update last login timestamp
        await db.query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [admin.id]);

        const token = generateAdminToken(admin);
        delete admin.password_hash;

        return successResponse(res, {
            message: 'Admin authentication successful',
            data: {
                token,
                admin: {
                    id: admin.id,
                    agency_id: admin.agency_id,
                    agency_name: admin.agency_name,
                    agency_slug: admin.agency_slug,
                    first_name: admin.first_name,
                    last_name: admin.last_name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                }
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Admin login failed' });
    }
}

// GET /api/admin/auth/me
async function getAdminProfile(req, res) {
    try {
        const { rows } = await db.query(
            `SELECT a.id, a.agency_id, a.first_name, a.last_name, a.email, a.role, a.permissions, a.profile_photo_url,
              g.name as agency_name, g.slug as agency_slug, g.logo_url as agency_logo
       FROM admin_users a
       JOIN agencies g ON g.id = a.agency_id
       WHERE a.id = $1`,
            [req.admin.id]
        );

        return successResponse(res, { data: { admin: rows[0] } });
    } catch (err) {
        console.error('Get admin profile error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to retrieve admin profile' });
    }
}

module.exports = { adminLogin, getAdminProfile };

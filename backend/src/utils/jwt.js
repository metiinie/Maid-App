const jwt = require('jsonwebtoken');

const USER_SECRET = process.env.JWT_SECRET || 'ethio_recruitment_user_jwt_secret_key_32bytes_min!';
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'ethio_recruitment_admin_jwt_secret_key_32bytes_min!';

function generateUserToken(user) {
    return jwt.sign(
        {
            id: user.id,
            phone: user.phone,
            mode: user.preferred_mode || 'job_seeker',
            type: 'user'
        },
        USER_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
}

function generateAdminToken(admin) {
    return jwt.sign(
        {
            id: admin.id,
            agencyId: admin.agency_id,
            role: admin.role,
            email: admin.email,
            type: 'admin'
        },
        ADMIN_SECRET,
        { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '8h' }
    );
}

function verifyUserToken(token) {
    return jwt.verify(token, USER_SECRET);
}

function verifyAdminToken(token) {
    return jwt.verify(token, ADMIN_SECRET);
}

module.exports = {
    generateUserToken,
    generateAdminToken,
    verifyUserToken,
    verifyAdminToken
};

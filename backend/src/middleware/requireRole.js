const { errorResponse } = require('../utils/response');

function requireRole(allowedRoles = []) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.admin) {
            return errorResponse(res, { statusCode: 401, message: 'Admin authorization required' });
        }

        if (roles.length > 0 && !roles.includes(req.admin.role)) {
            return errorResponse(res, {
                statusCode: 403,
                message: `Insufficient permissions. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
}

module.exports = requireRole;

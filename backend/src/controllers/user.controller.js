const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/users/me
async function getProfile(req, res) {
    try {
        const userId = req.user.id;

        // Fetch base user
        const { rows: userRows } = await db.query(
            `SELECT id, first_name, last_name, email, phone, date_of_birth, gender, nationality,
              profile_photo_url, preferred_mode, is_verified, phone_verified, email_verified, created_at
       FROM users WHERE id = $1`,
            [userId]
        );

        const user = userRows[0];

        // Fetch mode profile
        let jobseekerProfile = null;
        let employerProfile = null;

        if (user.preferred_mode === 'job_seeker') {
            const { rows: jsRows } = await db.query(
                'SELECT * FROM user_jobseeker_profiles WHERE user_id = $1',
                [userId]
            );
            jobseekerProfile = jsRows[0] || null;
        } else {
            const { rows: empRows } = await db.query(
                'SELECT * FROM user_employer_profiles WHERE user_id = $1',
                [userId]
            );
            employerProfile = empRows[0] || null;
        }

        return successResponse(res, {
            data: {
                user,
                jobseeker_profile: jobseekerProfile,
                employer_profile: employerProfile
            }
        });
    } catch (err) {
        console.error('Get user profile error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch user profile' });
    }
}

// PUT /api/users/me
async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { first_name, last_name, email, date_of_birth, gender, nationality, profile_photo_url } = req.body;

        const { rows } = await db.query(
            `UPDATE users SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         email = COALESCE($3, email),
         date_of_birth = COALESCE($4, date_of_birth),
         gender = COALESCE($5, gender),
         nationality = COALESCE($6, nationality),
         profile_photo_url = COALESCE($7, profile_photo_url),
         updated_at = NOW()
       WHERE id = $8
       RETURNING id, first_name, last_name, email, phone, date_of_birth, gender, nationality, profile_photo_url`,
            [first_name, last_name, email, date_of_birth, gender, nationality, profile_photo_url, userId]
        );

        return successResponse(res, { message: 'Profile updated successfully', data: { user: rows[0] } });
    } catch (err) {
        console.error('Update profile error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update profile' });
    }
}

// PUT /api/users/me/jobseeker-profile
async function updateJobseekerProfile(req, res) {
    try {
        const userId = req.user.id;
        const {
            bio, current_country, city, education_level, years_of_experience,
            passport_number, passport_expiry, has_overseas_experience,
            preferred_destination_countries, preferred_job_categories, expected_salary_min, expected_salary_currency
        } = req.body;

        const { rows } = await db.query(
            `INSERT INTO user_jobseeker_profiles (
         user_id, bio, current_country, city, education_level, years_of_experience,
         passport_number, passport_expiry, has_overseas_experience,
         preferred_destination_countries, preferred_job_categories, expected_salary_min, expected_salary_currency
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (user_id) DO UPDATE SET
         bio = COALESCE(EXCLUDED.bio, user_jobseeker_profiles.bio),
         current_country = COALESCE(EXCLUDED.current_country, user_jobseeker_profiles.current_country),
         city = COALESCE(EXCLUDED.city, user_jobseeker_profiles.city),
         education_level = COALESCE(EXCLUDED.education_level, user_jobseeker_profiles.education_level),
         years_of_experience = COALESCE(EXCLUDED.years_of_experience, user_jobseeker_profiles.years_of_experience),
         passport_number = COALESCE(EXCLUDED.passport_number, user_jobseeker_profiles.passport_number),
         passport_expiry = COALESCE(EXCLUDED.passport_expiry, user_jobseeker_profiles.passport_expiry),
         has_overseas_experience = COALESCE(EXCLUDED.has_overseas_experience, user_jobseeker_profiles.has_overseas_experience),
         preferred_destination_countries = COALESCE(EXCLUDED.preferred_destination_countries, user_jobseeker_profiles.preferred_destination_countries),
         preferred_job_categories = COALESCE(EXCLUDED.preferred_job_categories, user_jobseeker_profiles.preferred_job_categories),
         expected_salary_min = COALESCE(EXCLUDED.expected_salary_min, user_jobseeker_profiles.expected_salary_min),
         expected_salary_currency = COALESCE(EXCLUDED.expected_salary_currency, user_jobseeker_profiles.expected_salary_currency),
         updated_at = NOW()
       RETURNING *`,
            [
                userId, bio, current_country, city, education_level, years_of_experience || 0,
                passport_number, passport_expiry, has_overseas_experience || false,
                preferred_destination_countries, preferred_job_categories, expected_salary_min, expected_salary_currency || 'USD'
            ]
        );

        return successResponse(res, { message: 'Jobseeker profile updated', data: { profile: rows[0] } });
    } catch (err) {
        console.error('Update jobseeker profile error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update jobseeker profile' });
    }
}

// POST /api/users/me/device-token
async function registerDeviceToken(req, res) {
    try {
        const userId = req.user.id;
        const { token, platform } = req.body;

        await db.query(
            `INSERT INTO device_tokens (user_id, token, platform)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
            [userId, token, platform]
        );

        return successResponse(res, { message: 'Device token registered successfully' });
    } catch (err) {
        console.error('Register device token error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to register device token' });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    updateJobseekerProfile,
    registerDeviceToken
};

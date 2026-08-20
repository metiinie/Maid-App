const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/vacancies
async function getPublicVacancies(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category_id,
            agency_id,
            destination_country,
            gender_preference,
            min_salary,
            contract_type,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [];
        let queryWhere = "WHERE v.status = 'active'";
        let paramIndex = 1;

        if (agency_id) {
            queryWhere += ` AND v.agency_id = $${paramIndex}`;
            params.push(agency_id);
            paramIndex++;
        }

        if (search) {
            queryWhere += ` AND (v.title ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex} OR v.destination_country ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category_id) {
            queryWhere += ` AND v.category_id = $${paramIndex}`;
            params.push(category_id);
            paramIndex++;
        }

        if (destination_country) {
            queryWhere += ` AND v.destination_country ILIKE $${paramIndex}`;
            params.push(`%${destination_country}%`);
            paramIndex++;
        }

        if (gender_preference) {
            queryWhere += ` AND (v.gender_preference = $${paramIndex} OR v.gender_preference = 'any')`;
            params.push(gender_preference);
            paramIndex++;
        }

        if (min_salary) {
            queryWhere += ` AND v.salary_max >= $${paramIndex}`;
            params.push(parseFloat(min_salary));
            paramIndex++;
        }

        if (contract_type) {
            queryWhere += ` AND v.contract_type = $${paramIndex}`;
            params.push(contract_type);
            paramIndex++;
        }

        const countRes = await db.query(
            `SELECT COUNT(*) FROM job_vacancies v ${queryWhere}`,
            params
        );
        const totalItems = parseInt(countRes.rows[0].count, 10);

        const validSortFields = ['created_at', 'application_count', 'view_count', 'salary_min'];
        const orderField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const itemsQuery = `
      SELECT v.id, v.agency_id, g.name as agency_name, g.logo_url as agency_logo,
             v.title, v.destination_country, v.city, v.salary_min, v.salary_max, v.salary_currency,
             v.contract_duration_months, v.contract_type, v.gender_preference,
             v.positions_available, v.positions_filled, v.is_featured,
             v.view_count, v.application_count, v.created_at
      FROM job_vacancies v
      JOIN agencies g ON g.id = v.agency_id
      ${queryWhere}
      ORDER BY v.${orderField} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(parseInt(limit, 10), offset);
        const { rows: vacancies } = await db.query(itemsQuery, params);

        return successResponse(res, {
            data: vacancies,
            meta: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit, 10))
            }
        });
    } catch (err) {
        console.error('getPublicVacancies error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch public job vacancies' });
    }
}

// GET /api/vacancies/featured
async function getFeaturedVacancies(req, res) {
    try {
        const { limit = 10 } = req.query;

        const { rows } = await db.query(
            `SELECT v.id, v.agency_id, g.name as agency_name, g.logo_url as agency_logo,
              v.title, v.destination_country, v.city, v.salary_min, v.salary_max, v.salary_currency,
              v.contract_type, v.positions_available, v.created_at
       FROM job_vacancies v
       JOIN agencies g ON g.id = v.agency_id
       WHERE v.status = 'active' AND v.is_featured = true
       ORDER BY v.created_at DESC
       LIMIT $1`,
            [parseInt(limit, 10)]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getFeaturedVacancies error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch featured vacancies' });
    }
}

// GET /api/vacancies/:id
async function getPublicVacancyById(req, res) {
    try {
        const { id } = req.params;

        // Asynchronously increment view count
        await db.query('UPDATE job_vacancies SET view_count = view_count + 1 WHERE id = $1', [id]);

        const { rows } = await db.query(
            `SELECT v.*, g.name as agency_name, g.logo_url as agency_logo, g.phone as agency_phone, g.email as agency_email,
              cat.name as category_name
       FROM job_vacancies v
       JOIN agencies g ON g.id = v.agency_id
       LEFT JOIN categories cat ON cat.id = v.category_id
       WHERE v.id = $1 AND v.status = 'active'`,
            [id]
        );

        const vacancy = rows[0];
        if (!vacancy) {
            return errorResponse(res, { statusCode: 404, message: 'Job vacancy not found or inactive' });
        }

        const [skills, languages] = await Promise.all([
            db.query('SELECT skill_name, is_required FROM vacancy_skills_required WHERE vacancy_id = $1', [id]),
            db.query('SELECT language, proficiency_required, is_required FROM vacancy_languages_required WHERE vacancy_id = $1', [id])
        ]);

        vacancy.skills_required = skills.rows;
        vacancy.languages_required = languages.rows;

        return successResponse(res, { data: vacancy });
    } catch (err) {
        console.error('getPublicVacancyById error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch job vacancy profile' });
    }
}

// POST /api/vacancies/:id/apply
async function applyForVacancy(req, res) {
    try {
        const { id: vacancyId } = req.params;
        const userId = req.user.id;
        const { cover_letter, additional_notes } = req.body;

        // Get vacancy and user snapshot
        const { rows: vacancyRows } = await db.query(
            "SELECT id, agency_id, title FROM job_vacancies WHERE id = $1 AND status = 'active'",
            [vacancyId]
        );

        const vacancy = vacancyRows[0];
        if (!vacancy) {
            return errorResponse(res, { statusCode: 404, message: 'Job vacancy not found or no longer active' });
        }

        const { rows: userRows } = await db.query(
            'SELECT first_name, last_name, phone, email FROM users WHERE id = $1',
            [userId]
        );

        const user = userRows[0];
        const applicantName = `${user.first_name} ${user.last_name}`.trim();

        // Check duplicate application
        const { rows: existingApp } = await db.query(
            'SELECT id FROM applications WHERE vacancy_id = $1 AND user_id = $2',
            [vacancyId, userId]
        );

        if (existingApp.length > 0) {
            return errorResponse(res, { statusCode: 400, message: 'You have already applied for this job vacancy' });
        }

        const { rows: appRows } = await db.query(
            `INSERT INTO applications (
         vacancy_id, user_id, agency_id, cover_letter, additional_notes, applicant_name, applicant_phone, applicant_email
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [vacancyId, userId, vacancy.agency_id, cover_letter || null, additional_notes || null, applicantName, user.phone, user.email || null]
        );

        // Increment application count on vacancy
        await db.query('UPDATE job_vacancies SET application_count = application_count + 1 WHERE id = $1', [vacancyId]);

        return successResponse(res, {
            statusCode: 201,
            message: 'Application submitted successfully',
            data: appRows[0]
        });
    } catch (err) {
        console.error('applyForVacancy error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to submit application' });
    }
}

// GET /api/users/me/applications
async function getUserApplications(req, res) {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            `SELECT a.*, v.title as vacancy_title, v.destination_country, v.city, v.salary_min, v.salary_max, v.salary_currency,
              g.name as agency_name, g.logo_url as agency_logo
       FROM applications a
       JOIN job_vacancies v ON v.id = a.vacancy_id
       JOIN agencies g ON g.id = a.agency_id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
            [userId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getUserApplications error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch user applications' });
    }
}

module.exports = {
    getPublicVacancies,
    getFeaturedVacancies,
    getPublicVacancyById,
    applyForVacancy,
    getUserApplications
};

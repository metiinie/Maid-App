const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/candidates
async function getPublicCandidates(req, res) {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            category_id,
            agency_id,
            gender,
            religion,
            min_age,
            max_age,
            min_experience,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [];
        let queryWhere = 'WHERE c.is_active = true AND c.is_deployed = false';
        let paramIndex = 1;

        if (agency_id) {
            queryWhere += ` AND c.agency_id = $${paramIndex}`;
            params.push(agency_id);
            paramIndex++;
        }

        if (search) {
            queryWhere += ` AND (c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.summary ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (gender) {
            queryWhere += ` AND c.gender = $${paramIndex}`;
            params.push(gender);
            paramIndex++;
        }

        if (religion) {
            queryWhere += ` AND c.religion = $${paramIndex}`;
            params.push(religion);
            paramIndex++;
        }

        if (min_experience) {
            queryWhere += ` AND c.years_of_experience >= $${paramIndex}`;
            params.push(parseInt(min_experience, 10));
            paramIndex++;
        }

        if (category_id) {
            queryWhere += ` AND EXISTS (SELECT 1 FROM candidate_categories cc WHERE cc.candidate_id = c.id AND cc.category_id = $${paramIndex})`;
            params.push(category_id);
            paramIndex++;
        }

        if (min_age || max_age) {
            if (min_age) {
                queryWhere += ` AND EXTRACT(YEAR FROM age(c.date_of_birth)) >= $${paramIndex}`;
                params.push(parseInt(min_age, 10));
                paramIndex++;
            }
            if (max_age) {
                queryWhere += ` AND EXTRACT(YEAR FROM age(c.date_of_birth)) <= $${paramIndex}`;
                params.push(parseInt(max_age, 10));
                paramIndex++;
            }
        }

        const countRes = await db.query(
            `SELECT COUNT(*) FROM candidates c ${queryWhere}`,
            params
        );
        const totalItems = parseInt(countRes.rows[0].count, 10);

        const validSortFields = ['created_at', 'view_count', 'inquiry_count', 'years_of_experience'];
        const orderField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const itemsQuery = `
      SELECT c.id, c.agency_id, g.name as agency_name, g.logo_url as agency_logo,
             c.first_name, c.last_name, c.date_of_birth,
             EXTRACT(YEAR FROM age(c.date_of_birth)) as age,
             c.gender, c.nationality, c.religion, c.profile_photo_url, c.introduction_video_url,
             c.current_country, c.city, c.education_level, c.years_of_experience,
             c.medical_clearance_status, c.availability_date, c.is_featured,
             c.view_count, c.inquiry_count, c.created_at
      FROM candidates c
      JOIN agencies g ON g.id = c.agency_id
      ${queryWhere}
      ORDER BY c.${orderField} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(parseInt(limit, 10), offset);
        const { rows: candidates } = await db.query(itemsQuery, params);

        return successResponse(res, {
            data: candidates,
            meta: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages: Math.ceil(totalItems / parseInt(limit, 10))
            }
        });
    } catch (err) {
        console.error('getPublicCandidates error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to retrieve candidate catalog' });
    }
}

// GET /api/candidates/featured
async function getFeaturedCandidates(req, res) {
    try {
        const { limit = 10 } = req.query;

        const { rows } = await db.query(
            `SELECT c.id, c.agency_id, g.name as agency_name, c.first_name, c.last_name,
              EXTRACT(YEAR FROM age(c.date_of_birth)) as age,
              c.gender, c.religion, c.profile_photo_url, c.introduction_video_url,
              c.years_of_experience, c.created_at
       FROM candidates c
       JOIN agencies g ON g.id = c.agency_id
       WHERE c.is_active = true AND c.is_featured = true AND c.is_deployed = false
       ORDER BY c.created_at DESC
       LIMIT $1`,
            [parseInt(limit, 10)]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getFeaturedCandidates error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch featured candidates' });
    }
}

// GET /api/candidates/:id
async function getPublicCandidateById(req, res) {
    try {
        const { id } = req.params;

        // Increment view count asynchronously
        await db.query('UPDATE candidates SET view_count = view_count + 1 WHERE id = $1', [id]);

        const { rows } = await db.query(
            `SELECT c.id, c.agency_id, g.name as agency_name, g.logo_url as agency_logo, g.phone as agency_phone, g.email as agency_email,
              c.first_name, c.last_name, c.date_of_birth, EXTRACT(YEAR FROM age(c.date_of_birth)) as age,
              c.gender, c.nationality, c.religion, c.profile_photo_url, c.introduction_video_url,
              c.current_country, c.city, c.summary, c.education_level, c.years_of_experience,
              c.medical_clearance_status, c.availability_date, c.is_featured, c.view_count, c.inquiry_count, c.created_at
       FROM candidates c
       JOIN agencies g ON g.id = c.agency_id
       WHERE c.id = $1 AND c.is_active = true`,
            [id]
        );

        const candidate = rows[0];
        if (!candidate) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found or inactive' });
        }

        const [categories, skills, languages, experience, education] = await Promise.all([
            db.query('SELECT cat.id, cat.name, cat.name_ar, cat.name_am, cc.is_primary FROM candidate_categories cc JOIN categories cat ON cat.id = cc.category_id WHERE cc.candidate_id = $1', [id]),
            db.query('SELECT skill_name, proficiency_level, years_experience FROM candidate_skills WHERE candidate_id = $1', [id]),
            db.query('SELECT language, proficiency FROM candidate_languages WHERE candidate_id = $1', [id]),
            db.query('SELECT job_title, employer_name, country, start_date, end_date, description FROM candidate_experience WHERE candidate_id = $1 ORDER BY start_date DESC', [id]),
            db.query('SELECT institution, degree, field_of_study, start_year, end_year FROM candidate_education WHERE candidate_id = $1 ORDER BY start_year DESC', [id])
        ]);

        candidate.categories = categories.rows;
        candidate.skills = skills.rows;
        candidate.languages = languages.rows;
        candidate.experience = experience.rows;
        candidate.education = education.rows;

        return successResponse(res, { data: candidate });
    } catch (err) {
        console.error('getPublicCandidateById error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to retrieve candidate profile' });
    }
}

// POST /api/candidates/:id/inquiry
async function createInquiry(req, res) {
    try {
        const { id: candidateId } = req.params;
        const userId = req.user ? req.user.id : null;
        const { employer_name, employer_phone, employer_email, message, preferred_contact_method = 'phone' } = req.body;

        const { rows } = await db.query(
            'SELECT id, agency_id, first_name, last_name FROM candidates WHERE id = $1 AND is_active = true',
            [candidateId]
        );

        const candidate = rows[0];
        if (!candidate) {
            return errorResponse(res, { statusCode: 404, message: 'Candidate not found' });
        }

        const { rows: inquiryRows } = await db.query(
            `INSERT INTO candidate_inquiries (
         candidate_id, agency_id, user_id, employer_name, employer_phone, employer_email, message, preferred_contact_method
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [candidateId, candidate.agency_id, userId, employer_name, employer_phone, employer_email, message, preferred_contact_method]
        );

        await db.query('UPDATE candidates SET inquiry_count = inquiry_count + 1 WHERE id = $1', [candidateId]);

        return successResponse(res, {
            statusCode: 201,
            message: 'Inquiry submitted successfully. The recruitment agency will contact you shortly.',
            data: inquiryRows[0]
        });
    } catch (err) {
        console.error('createInquiry error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to submit inquiry' });
    }
}

// GET /api/users/me/inquiries
async function getUserInquiries(req, res) {
    try {
        const userId = req.user.id;
        const { rows } = await db.query(
            `SELECT i.*, c.first_name as candidate_first_name, c.last_name as candidate_last_name, c.profile_photo_url as candidate_photo,
              g.name as agency_name, g.phone as agency_phone
       FROM candidate_inquiries i
       JOIN candidates c ON c.id = i.candidate_id
       JOIN agencies g ON g.id = i.agency_id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
            [userId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getUserInquiries error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch user inquiries' });
    }
}

// GET /api/categories
async function getCategories(req, res) {
    try {
        const { rows } = await db.query(
            'SELECT id, name, name_ar, name_am, description, icon_url, is_active FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC'
        );
        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getCategories error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch categories' });
    }
}

// GET /api/agencies
async function getAgencies(req, res) {
    try {
        const { rows } = await db.query(
            `SELECT id, name, slug, logo_url, rating, total_reviews, total_placements, is_verified
       FROM agencies
       WHERE is_active = true
       ORDER BY rating DESC, name ASC`
        );
        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getAgencies error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch agencies' });
    }
}

module.exports = {
    getPublicCandidates,
    getFeaturedCandidates,
    getPublicCandidateById,
    createInquiry,
    getUserInquiries,
    getCategories,
    getAgencies
};

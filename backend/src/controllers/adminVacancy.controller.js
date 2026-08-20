const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/admin/vacancies
async function getVacancies(req, res) {
    try {
        const agencyId = req.agencyId;
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            category_id,
            destination_country,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const params = [agencyId];
        let queryWhere = 'WHERE v.agency_id = $1';
        let paramIndex = 2;

        if (search) {
            queryWhere += ` AND (v.title ILIKE $${paramIndex} OR v.destination_country ILIKE $${paramIndex} OR v.employer_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            queryWhere += ` AND v.status = $${paramIndex}`;
            params.push(status);
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

        const countRes = await db.query(
            `SELECT COUNT(*) FROM job_vacancies v ${queryWhere}`,
            params
        );
        const totalItems = parseInt(countRes.rows[0].count, 10);

        const validSortFields = ['created_at', 'application_count', 'view_count', 'title'];
        const orderField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
        const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const itemsQuery = `
      SELECT v.*, cat.name as category_name
      FROM job_vacancies v
      LEFT JOIN categories cat ON cat.id = v.category_id
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
        console.error('getVacancies error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch job vacancies' });
    }
}

// POST /api/admin/vacancies
async function createVacancy(req, res) {
    const client = await db.pool.connect();
    try {
        const agencyId = req.agencyId;
        const adminUserId = req.admin.id;
        const {
            category_id,
            title,
            description,
            requirements,
            benefits,
            destination_country,
            city,
            employer_name,
            employer_type,
            show_employer_name = false,
            salary_min,
            salary_max,
            salary_currency = 'USD',
            salary_negotiable = false,
            contract_duration_months,
            contract_type,
            working_hours_per_day,
            working_days_per_week,
            visa_sponsorship = true,
            accommodation_provided = false,
            meals_provided = false,
            transportation_provided = false,
            health_insurance = false,
            annual_leave_days,
            gender_preference = 'any',
            age_min,
            age_max,
            experience_required_years = 0,
            education_required,
            religion_preference,
            positions_available = 1,
            application_deadline,
            expected_start_date,
            status = 'draft',
            is_featured = false,
            skills_required = [],
            languages_required = []
        } = req.body;

        await client.query('BEGIN');

        const publishedAt = status === 'active' ? new Date() : null;

        const { rows } = await client.query(
            `INSERT INTO job_vacancies (
         agency_id, posted_by, category_id, title, description, requirements, benefits,
         destination_country, city, employer_name, employer_type, show_employer_name,
         salary_min, salary_max, salary_currency, salary_negotiable,
         contract_duration_months, contract_type, working_hours_per_day, working_days_per_week,
         visa_sponsorship, accommodation_provided, meals_provided, transportation_provided,
         health_insurance, annual_leave_days, gender_preference, age_min, age_max,
         experience_required_years, education_required, religion_preference,
         positions_available, application_deadline, expected_start_date, status, is_featured, published_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12,
         $13, $14, $15, $16,
         $17, $18, $19, $20,
         $21, $22, $23, $24,
         $25, $26, $27, $28, $29,
         $30, $31, $32,
         $33, $34, $35, $36, $37, $38
       ) RETURNING *`,
            [
                agencyId, adminUserId, category_id || null, title, description, requirements, benefits,
                destination_country, city, employer_name, employer_type || null, show_employer_name,
                salary_min || null, salary_max || null, salary_currency, salary_negotiable,
                contract_duration_months || null, contract_type || null, working_hours_per_day || null, working_days_per_week || null,
                visa_sponsorship, accommodation_provided, meals_provided, transportation_provided,
                health_insurance, annual_leave_days || null, gender_preference, age_min || null, age_max || null,
                experience_required_years, education_required || null, religion_preference || null,
                positions_available, application_deadline || null, expected_start_date || null, status, is_featured, publishedAt
            ]
        );

        const vacancy = rows[0];

        // Insert required skills
        if (Array.isArray(skills_required) && skills_required.length > 0) {
            for (const skill of skills_required) {
                await client.query(
                    'INSERT INTO vacancy_skills_required (vacancy_id, skill_name, is_required) VALUES ($1, $2, $3)',
                    [vacancy.id, skill.skill_name || skill, skill.is_required !== undefined ? skill.is_required : true]
                );
            }
        }

        // Insert required languages
        if (Array.isArray(languages_required) && languages_required.length > 0) {
            for (const lang of languages_required) {
                await client.query(
                    'INSERT INTO vacancy_languages_required (vacancy_id, language, proficiency_required, is_required) VALUES ($1, $2, $3, $4)',
                    [vacancy.id, lang.language || lang, lang.proficiency_required || null, lang.is_required !== undefined ? lang.is_required : true]
                );
            }
        }

        await client.query('COMMIT');

        return successResponse(res, {
            statusCode: 201,
            message: 'Job vacancy created successfully',
            data: vacancy
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('createVacancy error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to create job vacancy' });
    } finally {
        client.release();
    }
}

// GET /api/admin/vacancies/:id
async function getVacancyById(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;

        const { rows } = await db.query(
            `SELECT v.*, cat.name as category_name
       FROM job_vacancies v
       LEFT JOIN categories cat ON cat.id = v.category_id
       WHERE v.id = $1 AND v.agency_id = $2`,
            [id, agencyId]
        );

        const vacancy = rows[0];
        if (!vacancy) {
            return errorResponse(res, { statusCode: 404, message: 'Job vacancy not found' });
        }

        const [skills, languages] = await Promise.all([
            db.query('SELECT * FROM vacancy_skills_required WHERE vacancy_id = $1', [id]),
            db.query('SELECT * FROM vacancy_languages_required WHERE vacancy_id = $1', [id])
        ]);

        vacancy.skills_required = skills.rows;
        vacancy.languages_required = languages.rows;

        return successResponse(res, { data: vacancy });
    } catch (err) {
        console.error('getVacancyById error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch job vacancy' });
    }
}

// PUT /api/admin/vacancies/:id
async function updateVacancy(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;
        const updateData = req.body;

        delete updateData.id;
        delete updateData.agency_id;
        delete updateData.posted_by;
        delete updateData.created_at;

        const fields = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (value !== undefined) {
                fields.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (fields.length === 0) {
            return errorResponse(res, { statusCode: 400, message: 'No valid fields provided to update' });
        }

        values.push(id, agencyId);
        const query = `
      UPDATE job_vacancies
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex} AND agency_id = $${paramIndex + 1}
      RETURNING *
    `;

        const { rows } = await db.query(query, values);
        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Job vacancy not found' });
        }

        return successResponse(res, { message: 'Job vacancy updated successfully', data: rows[0] });
    } catch (err) {
        console.error('updateVacancy error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update job vacancy' });
    }
}

// DELETE /api/admin/vacancies/:id
async function deleteVacancy(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;

        const { rowCount } = await db.query(
            'DELETE FROM job_vacancies WHERE id = $1 AND agency_id = $2',
            [id, agencyId]
        );

        if (rowCount === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Job vacancy not found' });
        }

        return successResponse(res, { message: 'Job vacancy deleted successfully' });
    } catch (err) {
        console.error('deleteVacancy error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to delete job vacancy' });
    }
}

// PATCH /api/admin/vacancies/:id/status
async function updateVacancyStatus(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;
        const { status } = req.body;

        const publishedAt = status === 'active' ? new Date() : null;

        const { rows } = await db.query(
            `UPDATE job_vacancies
       SET status = $1, published_at = COALESCE(published_at, $2), updated_at = NOW()
       WHERE id = $3 AND agency_id = $4
       RETURNING *`,
            [status, publishedAt, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Job vacancy not found' });
        }

        return successResponse(res, { message: 'Vacancy status updated successfully', data: rows[0] });
    } catch (err) {
        console.error('updateVacancyStatus error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update vacancy status' });
    }
}

// GET /api/admin/vacancies/:id/applications
async function getVacancyApplications(req, res) {
    try {
        const agencyId = req.agencyId;
        const { id } = req.params;

        const { rows } = await db.query(
            `SELECT a.*, u.first_name as user_first_name, u.last_name as user_last_name, u.phone as user_phone, u.email as user_email
       FROM applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.vacancy_id = $1 AND a.agency_id = $2
       ORDER BY a.applied_at DESC`,
            [id, agencyId]
        );

        return successResponse(res, { data: rows });
    } catch (err) {
        console.error('getVacancyApplications error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to fetch vacancy applications' });
    }
}

// PATCH /api/admin/applications/:id/status
async function updateApplicationStatus(req, res) {
    try {
        const agencyId = req.agencyId;
        const adminUserId = req.admin.id;
        const { id } = req.params;
        const { status, rejection_reason, reviewer_notes } = req.body;

        const { rows } = await db.query(
            `UPDATE applications
       SET status = $1, rejection_reason = $2, reviewer_notes = $3, reviewed_by = $4, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $5 AND agency_id = $6
       RETURNING *`,
            [status, rejection_reason || null, reviewer_notes || null, adminUserId, id, agencyId]
        );

        if (rows.length === 0) {
            return errorResponse(res, { statusCode: 404, message: 'Application not found' });
        }

        return successResponse(res, { message: 'Application status updated successfully', data: rows[0] });
    } catch (err) {
        console.error('updateApplicationStatus error:', err);
        return errorResponse(res, { statusCode: 500, message: 'Failed to update application status' });
    }
}

module.exports = {
    getVacancies,
    createVacancy,
    getVacancyById,
    updateVacancy,
    deleteVacancy,
    updateVacancyStatus,
    getVacancyApplications,
    updateApplicationStatus
};
